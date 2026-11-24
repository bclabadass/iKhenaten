#include "building_gatehouse.h"

#include "core/calc.h"
#include "grid/grid.h"
#include "grid/property.h"
#include "core/direction.h"
#include "grid/terrain.h"
#include "grid/building.h"
#include "grid/building_tiles.h"
#include "window/building/common.h"
#include "graphics/elements/ui.h"
#include "io/gamefiles/lang.h"
#include "graphics/graphics.h"
#include "widget/city/ornaments.h"
#include "building/rotation.h"
#include "construction/build_planner.h"
#include "grid/image.h"
#include "city/city.h"
#include "grid/road_access.h"
#include "grid/orientation.h"
#include "grid/routing/routing_terrain.h"
#include "building/building_wall.h"
#include "city/city.h"
#include "game/gods.h"
#include "game/undo.h"

#include "js/js_register.h"

#include <algorithm>

REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_brick_gatehouse);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_strong_gatehouse);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_mud_gatehouse);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_decorative_gatehouse);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_tower_gatehouse);

namespace archive_helper {
    template <>
    inline void reader<building_mud_gatehouse::static_params>(archive arch,
      building_mud_gatehouse::static_params& params) {
        archive_helper::reader(arch, (building_static_params&)params);
    }
    template <>
    inline void reader<building_decorative_gatehouse::static_params>(archive arch,
      building_decorative_gatehouse::static_params& params) {
        archive_helper::reader(arch, (building_static_params&)params);
    }
} // namespace archive_helper

building_gatehouse::back_tile_orientation building_gatehouse::second_part_tile(tile2i end, int city_orientation) {
    struct candidate_t {
        tile2i tile;
        int orientation = -1;
        bool ok = false;
        bool road = false;
    };

    const uint32_t restricted_terrain = TERRAIN_ALL - TERRAIN_ROAD;
    auto make_candidate = [&] (tile2i tile, int orientation) {
        candidate_t c;
        c.tile = tile;
        c.orientation = orientation;
        blocked_tile_vec tmp_tiles;
        c.ok = !build_planner::is_blocked_for_building(tile, 1, tmp_tiles, restricted_terrain);
        c.road = c.ok && map_terrain_is(tile, TERRAIN_ROAD);
        return c;
    };

    candidate_t first, second;
    switch (city_orientation) {
    case 0:
        first = make_candidate(end.shifted(0, -1), 0);
        second = make_candidate(end.shifted(1, 0), 1);
        break;
    case 1:
        first = make_candidate(end.shifted(0, -1), 1);
        second = make_candidate(end.shifted(1, 0), 2);
        break;
    case 2:
        first = make_candidate(end.shifted(0, 1), 2);
        second = make_candidate(end.shifted(1, 0), 3);
        break;
    case 3:
        first = make_candidate(end.shifted(0, 1), 3);
        second = make_candidate(end.shifted(-1, 0), 0);
        break;
    default:
        return { tile2i(), -1 };
    }

    const candidate_t *picked = nullptr;
    if (first.road != second.road) {
        picked = first.road ? &first : &second;
    } else if (first.road && second.road) {
        picked = (building_rotation_get_road_orientation() == 2) ? &second : &first;
    } else if (second.ok) {
        picked = &second;
    } else if (first.ok) {
        picked = &first;
    }

    if (!picked) {
        return { tile2i(), -1 };
    }
    return { picked->tile, picked->orientation };
}

void building_gatehouse::on_create(int orientation) {
    base.orientation = orientation;
}

static bool is_gatehouse_building_type(e_building_type type) {
    switch (type) {
    case BUILDING_MUD_GATEHOUSE:
    case BUILDING_MUD_GATEHOUSE_UP:
    case BUILDING_GATEHOUSE:
    case BUILDING_BRICK_GATEHOUSE:
    case BUILDING_BRICK_GATEHOUSE_UP:
    case BUILDING_DECORATIVE_GATEHOUSE:
    case BUILDING_TOWER_GATEHOUSE:
        return true;
    default:
        return false;
    }
}

// OG mud/brick gatehouse is a size-2 footprint. The road pair is two opposite tiles;
// the other two tiles of the 2x2 are the flanking side parts (cover sprites).
static tile2i gatehouse_footprint_origin(tile2i road_a, tile2i road_b) {
    const int x0 = std::min(road_a.x(), road_b.x());
    const int y0 = std::min(road_a.y(), road_b.y());
    const bool horizontal = road_a.y() == road_b.y();

    tile2i candidates[2];
    if (horizontal) {
        candidates[0] = tile2i(x0, y0 - 1);
        candidates[1] = tile2i(x0, y0);
    } else {
        candidates[0] = tile2i(x0 - 1, y0);
        candidates[1] = tile2i(x0, y0);
    }

    auto score = [&](tile2i origin) {
        if (!map_grid_is_inside(origin, 2)) {
            return -1;
        }
        int s = 0;
        if (map_orientation_for_gatehouse(origin.x(), origin.y()) > 0) {
            s += 10;
        }
        for (int dy = 0; dy < 2; dy++) {
            for (int dx = 0; dx < 2; dx++) {
                const tile2i t = origin.shifted(dx, dy);
                if (t == road_a || t == road_b) {
                    continue;
                }
                if (map_terrain_is(t, TERRAIN_WALL) || map_terrain_is(t, TERRAIN_GATEHOUSE)) {
                    s += 2;
                }
            }
        }
        return s;
    };

    int best = -1;
    tile2i origin = candidates[1];
    for (tile2i c : candidates) {
        const int s = score(c);
        if (s > best) {
            best = s;
            origin = c;
        }
    }
    return origin;
}

static void apply_gatehouse_footprint_images(tile2i main_tile, tile2i back_tile, int main_image, int back_image, int cover_main, int cover_back) {
    map_image_set(main_tile, main_image);
    map_image_set(back_tile, back_image);

    tile2i origin = gatehouse_footprint_origin(main_tile, back_tile);
    const bool horizontal_pair = main_tile.y() == back_tile.y();

    for (int dy = 0; dy < 2; dy++) {
        for (int dx = 0; dx < 2; dx++) {
            const tile2i tile = origin.shifted(dx, dy);
            if (tile == main_tile || tile == back_tile) {
                continue;
            }
            if (!map_terrain_is(tile, TERRAIN_GATEHOUSE)) {
                continue;
            }

            const int cover = horizontal_pair
                ? (tile.x() == main_tile.x() ? cover_main : cover_back)
                : (tile.y() == main_tile.y() ? cover_main : cover_back);
            map_image_set(tile, cover ? cover : (horizontal_pair
                ? (tile.x() == main_tile.x() ? main_image : back_image)
                : (tile.y() == main_tile.y() ? main_image : back_image)));
        }
    }
}

static void apply_gatehouse_tile_images(tile2i main_tile, tile2i back_tile, const building_static_params &bparams) {
    const int city_orientation = map_view_orientation() / 2;
    const int building_rotation = calc_general_direction(main_tile, back_tile) / 2;

    static const xstring txs[6] = {
        "base_n", "base_w", "base_second_n", "base_second_w", "base_cover_n", "base_cover_w"
    };
    int ids[6] = {};
    for (int i = 0; i < 6; ++i) {
        ids[i] = bparams.first_img(txs[i]);
    }

    int main_image = 0;
    int back_image = 0;
    int cover_main = 0;
    int cover_back = 0;
    if (building_rotation == 0 || building_rotation == 2) {
        switch (city_orientation) {
        case 0:
            main_image = ids[0];
            back_image = ids[2];
            cover_main = ids[4];
            cover_back = ids[4];
            break;
        case 1:
            main_image = ids[1];
            back_image = ids[3];
            cover_main = ids[5];
            cover_back = ids[5];
            break;
        case 2:
            main_image = ids[2];
            back_image = ids[0];
            cover_main = ids[4];
            cover_back = ids[4];
            break;
        case 3:
            main_image = ids[3];
            back_image = ids[1];
            cover_main = ids[5];
            cover_back = ids[5];
            break;
        }
    } else if (building_rotation == 1 || building_rotation == 3) {
        switch (city_orientation) {
        case 0:
            main_image = ids[1];
            back_image = ids[3];
            cover_main = ids[5];
            cover_back = ids[5];
            break;
        case 1:
            main_image = ids[2];
            back_image = ids[0];
            cover_main = ids[4];
            cover_back = ids[4];
            break;
        case 2:
            main_image = ids[3];
            back_image = ids[1];
            cover_main = ids[5];
            cover_back = ids[5];
            break;
        case 3:
            main_image = ids[0];
            back_image = ids[2];
            cover_main = ids[4];
            cover_back = ids[4];
            break;
        }
    } else {
        return;
    }

    apply_gatehouse_footprint_images(main_tile, back_tile, main_image, back_image, cover_main, cover_back);
}

static tile2i infer_gatehouse_back_tile(const building &maingate) {
    const tile2i main_tile = maingate.tile;
    const tile2i neighbors[4] = {
        tile2i(main_tile.x() + 1, main_tile.y()),
        tile2i(main_tile.x() - 1, main_tile.y()),
        tile2i(main_tile.x(), main_tile.y() + 1),
        tile2i(main_tile.x(), main_tile.y() - 1),
    };

    for (const tile2i &neighbor : neighbors) {
        if (!map_terrain_is(neighbor, TERRAIN_GATEHOUSE)) {
            continue;
        }

        const int x0 = std::min(main_tile.x(), neighbor.x());
        const int y0 = std::min(main_tile.y(), neighbor.y());
        if (map_orientation_for_gatehouse(x0, y0) > 0) {
            return neighbor;
        }
    }

    return tile2i::invalid;
}

void building_gatehouse::update_image_set(building& maingate, tile2i back_tile) {
    if (!back_tile.valid()) {
        return;
    }

    apply_gatehouse_tile_images(maingate.tile, back_tile, maingate.params());
}

void building_gatehouse::update_image_set(building& maingate) {
    tile2i back_tile;
    if (maingate.next_part_building_id > 0) {
        back_tile = maingate.next()->tile;
    } else {
        back_tile = infer_gatehouse_back_tile(maingate);
    }

    update_image_set(maingate, back_tile);
}

void building_gatehouse::update_map_orientation(int orientation) {
    if (!is_main()) {
        return;
    }

    update_image_set(base);

    // if (orientation_index == 0 || orientation_index == 3) {
    //     // draw fort first, then ground
    //     int image_id = this->anim["base_n"].first_img();
    //     int image_sec_id = this->anim["base_second_n"].first_img();
    //     ghost_draw::draw_building_ghost(ctx, image_sec_id, ground_pixel);
    //     ghost_draw::draw_building_ghost(ctx, image_id, main_pixel);
    // } else {
    //     // draw ground first, then fort
    //     int image_id = this->anim["base_w"].first_img();
    //     int image_sec_id = this->anim["base_second_w"].first_img();
    //     ghost_draw::draw_building_ghost(ctx, image_sec_id, main_pixel);
    //     ghost_draw::draw_building_ghost(ctx, image_id, ground_pixel);
    // }
}

void building_gatehouse::on_place_update_tiles(int orientation, int variant) {
    building_impl::on_place_update_tiles(orientation, variant);
}

void building_gatehouse::on_place(int orientation, int variant) {
    building_impl::on_place(orientation, variant);

    const int city_orientation = map_view_orientation() / 2;
    back_tile_orientation back_tile = building_gatehouse::second_part_tile(tile(), city_orientation);

    building *backside, *mainside;
    bool bactile_is_main = false;
    if (tilex() == back_tile.tile.x()) {
        bactile_is_main = (tiley() < back_tile.tile.y());
    } else if (tiley() == back_tile.tile.y()) {
        bactile_is_main = (tilex() < back_tile.tile.x());
    }

    if (!bactile_is_main) {
        backside = building_create(type(), back_tile.tile, 0);
        backside->prev_part_building_id = id();
        base.next_part_building_id = backside->id;
        backside->next_part_building_id = 0;
        mainside = &base;
    } else {
        backside = building_create(type(), back_tile.tile, 0);
        base.prev_part_building_id = backside->id;
        base.next_part_building_id = 0;
        backside->next_part_building_id = base.id;
        backside->prev_part_building_id = 0;
        mainside = backside;
    }
    verify_no_crash(backside && mainside);

    base.orientation = back_tile.orientation;
    claim_2x2_footprint(base, *backside);

    map_routing_update_land();
    map_routing_update_walls();
}

tile2i building_gatehouse::claim_2x2_footprint(building &part_a, building &part_b) {
    building *mainside = part_a.is_main() ? &part_a : &part_b;

    const tile2i road_a = part_a.tile;
    const tile2i road_b = part_b.tile;
    tile2i origin = gatehouse_footprint_origin(road_a, road_b);

    for (int dy = 0; dy < 2; dy++) {
        for (int dx = 0; dx < 2; dx++) {
            const tile2i tile = origin.shifted(dx, dy);
            const bool is_road_part = (tile == road_a || tile == road_b);
            const int existing = map_building_at(tile);
            if (!is_road_part && existing && existing != part_a.id && existing != part_b.id) {
                continue;
            }

            const int bid = (tile == road_b) ? part_b.id : mainside->id;
            int terrain = TERRAIN_GATEHOUSE | TERRAIN_BUILDING;
            if (is_road_part || map_terrain_is(tile, TERRAIN_ROAD)) {
                terrain |= TERRAIN_ROAD;
            }
            map_building_tiles_add(bid, tile, 1, 0, terrain);
        }
    }

    update_image_set(*mainside);
    building_mud_wall::update_area_walls(origin, 2);
    return origin;
}

void building_gatehouse::spawn_figure() {
    // OG: mud/brick gatehouses do not request tower sentries — only towers do.
    building *main_building = base.main();
    if (!main_building->is_valid()) {
        return;
    }

    building_impl *main_impl = main_building->dcast();
    main_impl->check_labor_problem();
    tile2i road = map_get_road_access_tile(main_building->tile, main_building->size);
    if (!road.valid()) {
        return;
    }

    main_impl->common_spawn_labor_seeker(main_building->params().min_houses_coverage);
}

namespace {

    vec2i gatehouse_view_offset(int dx, int dy) {
        int sx = 0;
        int sy = 0;
        switch (map_view_orientation()) {
        case DIR_0_TOP_RIGHT:
            sx = dx - dy;
            sy = dx + dy;
            break;
        case DIR_2_BOTTOM_RIGHT:
            sx = dx + dy;
            sy = dy - dx;
            break;
        case DIR_4_BOTTOM_LEFT:
            sx = dy - dx;
            sy = -dx - dy;
            break;
        default:
            sx = -dx - dy;
            sy = dx - dy;
            break;
        }
        return {sx * 30, sy * 15};
    }

    // Each picture comes in two frames: frame 0 for a wall running along the screen's x, frame 1 along its y.
    int gatehouse_frame(int axis) {
        return (axis + map_view_orientation() / 2) % 2;
    }

    int city_patron_god() {
        for (int god = GOD_OSIRIS; god < MAX_GODS; ++god) {
            if (g_city.religion.is_god_known((e_god)god) == GOD_STATUS_PATRON) {
                return god;
            }
        }
        return -1;
    }

    struct gatehouse_piece {
        tile2i tile;
        int size;
        int image_id;
        uint32_t terrain;
    };

    // Pieces in drawing order, back to front: gate[0..1], pylon[0..1] by the camera's depth.
    svector<gatehouse_piece, 4> gatehouse_pieces(e_building_type type, const building_gatehouse_5x2::layout_t& layout) {
        const auto& params = building_static_params::get(type);
        const int frame = gatehouse_frame(layout.axis);
        const bool first_gate_near = map_view_tile_depth(layout.gate[0]) > map_view_tile_depth(layout.gate[1]);
        const tile2i near_gate = first_gate_near ? layout.gate[0] : layout.gate[1];
        const tile2i far_gate = first_gate_near ? layout.gate[1] : layout.gate[0];
        const int pylon = building_gatehouse_5x2::pylon_image(type, frame);
        const uint32_t gate_terrain = TERRAIN_BUILDING | TERRAIN_GATEHOUSE | TERRAIN_ROAD;
        const uint32_t pylon_terrain = TERRAIN_BUILDING | TERRAIN_GATEHOUSE;

        svector<gatehouse_piece, 4> pieces;
        pieces.push_back({far_gate, 1, params.first_img("gate_back") + frame, gate_terrain});
        pieces.push_back({near_gate, 1, params.first_img("gate_front") + frame, gate_terrain});
        pieces.push_back({layout.pylon[0], 2, pylon, pylon_terrain});
        pieces.push_back({layout.pylon[1], 2, pylon, pylon_terrain});
        std::sort(pieces.begin(), pieces.end(), [](const gatehouse_piece& a, const gatehouse_piece& b) {
            return map_view_tile_depth(map_view_draw_tile(a.tile, a.size))
                   < map_view_tile_depth(map_view_draw_tile(b.tile, b.size));
        });
        return pieces;
    }

} // namespace

building_gatehouse_5x2::layout_t building_gatehouse_5x2::layout_at(tile2i gate, int axis) {
    layout_t layout;
    layout.axis = axis % 2;
    layout.gate[0] = gate;
    if (layout.axis == 0) {
        layout.gate[1] = gate.shifted(0, 1);
        layout.pylon[0] = gate.shifted(-2, 0);
        layout.pylon[1] = gate.shifted(1, 0);
    } else {
        layout.gate[1] = gate.shifted(1, 0);
        layout.pylon[0] = gate.shifted(0, -2);
        layout.pylon[1] = gate.shifted(0, 1);
    }
    return layout;
}

bool building_gatehouse_5x2::layout_blocked(const layout_t& layout, blocked_tile_vec* blocked_tiles) {
    blocked_tile_vec tiles;
    bool blocked = false;
    auto check = [&](tile2i tile, uint32_t restricted) {
        if (!map_grid_is_inside(tile, 1)) {
            tiles.push_back({tile, true});
            blocked = true;
            return;
        }
        blocked |= build_planner::is_blocked_for_building(tile, 1, tiles, restricted) > 0;
    };
    for (const tile2i& gate : layout.gate) {
        check(gate, TERRAIN_ALL - TERRAIN_ROAD);
    }
    for (tile2i pylon : layout.pylon) {
        for (int dy = 0; dy < 2; ++dy) {
            for (int dx = 0; dx < 2; ++dx) {
                check(pylon.shifted(dx, dy), TERRAIN_ALL);
            }
        }
    }
    if (blocked_tiles) {
        *blocked_tiles = tiles;
    }
    return blocked;
}

int building_gatehouse_5x2::pylon_image(e_building_type type, int frame) {
    static const xstring god_keys[MAX_GODS] = {"pylon_osiris", "pylon_ra", "pylon_ptah", "pylon_seth", "pylon_bast"};
    const auto& params = building_static_params::get(type);
    const int god = city_patron_god();
    const int image_id = god >= 0 ? params.first_img(god_keys[god]) : 0;
    return (image_id > 0 ? image_id : params.first_img("pylon")) + frame;
}

void building_gatehouse_5x2::refresh_images(building& main) {
    building* parts[4] = {&main, nullptr, nullptr, nullptr};
    for (int i = 1; i < 4; ++i) {
        building* next = parts[i - 1]->next_part_building_id > 0 ? parts[i - 1]->next() : nullptr;
        if (!next || next->id <= 0) {
            return;
        }
        parts[i] = next;
    }

    const layout_t layout = layout_at(main.tile, main.orientation);
    for (const gatehouse_piece& piece : gatehouse_pieces(main.type, layout)) {
        for (building* part : parts) {
            if (part->tile == piece.tile) {
                map_building_tiles_add(part->id, piece.tile, piece.size, piece.image_id, piece.terrain);
            }
        }
    }
}

void building_gatehouse_5x2::on_create(int orientation) {
    base.orientation = orientation % 2;
}

void building_gatehouse_5x2::on_place(int orientation, int variant) {
    base.orientation = orientation % 2;
    if (base.next_part_building_id == 0) {
        const layout_t layout = layout_at(tile(), base.orientation);
        const tile2i part_tiles[3] = {layout.gate[1], layout.pylon[0], layout.pylon[1]};
        const int part_sizes[3] = {1, 2, 2};
        building* prev = &base;
        for (int i = 0; i < 3; ++i) {
            building* part = building_create(type(), part_tiles[i], base.orientation);
            if (!part || part->id <= 0) {
                break;
            }
            part->size = part_sizes[i];
            part->orientation = base.orientation;
            part->prev_part_building_id = prev->id;
            prev->next_part_building_id = part->id;
            prev = part;
        }
    }

    building_impl::on_place(orientation, variant);
    building_mud_wall::update_all_walls();
    map_routing_update_land();
    map_routing_update_walls();
}

void building_gatehouse_5x2::on_place_update_tiles(int orientation, int variant) {
    if (is_main()) {
        refresh_images(base);
    }
}

void building_gatehouse_5x2::update_map_orientation(int orientation) {
    if (is_main()) {
        refresh_images(base);
    }
}

void building_gatehouse_5x2::spawn_figure() {
    if (!is_main()) {
        return;
    }

    check_labor_problem();
    if (!map_get_road_access_tile(tile(), 1).valid()) {
        return;
    }
    common_spawn_labor_seeker(base.params().min_houses_coverage);
}

// A map's walls can carry gatehouses as bare terrain: two 2x2 pylons with the road between them and no building.
int building_gatehouse_5x2::map_gatehouses_to_buildings() {
    auto bare_gatehouse = [](tile2i tile) {
        return map_grid_is_inside(tile, 1) && map_terrain_is(tile, TERRAIN_GATEHOUSE) && map_building_at(tile) == 0;
    };
    auto bare_pylon = [&](tile2i tile) {
        return bare_gatehouse(tile) && bare_gatehouse(tile.shifted(1, 0)) && bare_gatehouse(tile.shifted(0, 1))
               && bare_gatehouse(tile.shifted(1, 1));
    };

    int created = 0;
    for (int y = 0; y < GRID_LENGTH; y++) {
        for (int x = 0; x < GRID_LENGTH; x++) {
            tile2i tile(x, y);
            if (!bare_pylon(tile)) {
                continue;
            }
            for (int axis = 0; axis < 2; ++axis) {
                const tile2i gate = axis == 0 ? tile.shifted(2, 0) : tile.shifted(0, 2);
                const layout_t layout = layout_at(gate, axis);
                if (!bare_pylon(layout.pylon[1]) || bare_gatehouse(layout.gate[0]) || bare_gatehouse(layout.gate[1])) {
                    continue;
                }
                for (tile2i pylon : layout.pylon) {
                    for (int dy = 0; dy < 2; ++dy) {
                        for (int dx = 0; dx < 2; ++dx) {
                            map_terrain_remove(pylon.shifted(dx, dy), TERRAIN_GATEHOUSE);
                        }
                    }
                }
                building* b = building_create(BUILDING_DECORATIVE_GATEHOUSE, gate, axis);
                if (b && b->id > 0) {
                    add_building(b, axis, 0);
                    b->state = BUILDING_STATE_VALID;
                    for (building* part = b; part->next_part_building_id > 0;) {
                        part = part->next();
                        part->state = BUILDING_STATE_VALID;
                    }
                    created++;
                }
                break;
            }
        }
    }
    return created;
}

void building_gatehouse_5x2::preview::collect_site(build_planner& planer, tile2i end) const {
    const layout_t layout = layout_at(end, planer.absolute_orientation);
    planer.site_orientation = layout.axis;
    planer.site_blocked = layout_blocked(layout, nullptr);
}

void building_gatehouse_5x2::preview::ghost_preview(build_planner& planer, painter& ctx, tile2i start, tile2i end,
  vec2i pixel) const {
    const layout_t layout = layout_at(end, planer.absolute_orientation);
    for (const gatehouse_piece& piece : gatehouse_pieces(planer.build_type, layout)) {
        const tile2i draw_tile = map_view_draw_tile(piece.tile, piece.size);
        const vec2i offset = gatehouse_view_offset(draw_tile.x() - end.x(), draw_tile.y() - end.y());
        ghost_draw::draw_building_ghost(ctx, piece.image_id, pixel + offset, COLOR_MASK_GREEN);
    }
}

void building_gatehouse_5x2::preview::ghost_blocked(build_planner& planer, painter& ctx, tile2i start, tile2i end,
  vec2i pixel, bool fully_blocked) const {
    blocked_tile_vec tiles;
    layout_blocked(layout_at(end, planer.absolute_orientation), &tiles);
    for (const blocked_tile& t : tiles) {
        const vec2i offset = gatehouse_view_offset(t.tile.x() - end.x(), t.tile.y() - end.y());
        ghost_draw::draw_ground_tile(ctx, pixel + offset,
          (fully_blocked || t.blocked) ? COLOR_MASK_RED_30 : COLOR_MASK_GREEN_30);
    }
}

int building_gatehouse_5x2::preview::can_place(build_planner& planer, tile2i start, tile2i end, int state) const {
    return planer.site_blocked ? CAN_NOT_PLACE : state;
}

int building_gatehouse_5x2::preview::finalize_check(build_planner& planer, tile2i start, tile2i end, int state) const {
    return layout_blocked(layout_at(end, planer.absolute_orientation), nullptr) ? CAN_NOT_PLACE : state;
}

void building_tower_gatehouse::update_map_orientation(int map_orientation) {
    building_impl::update_map_orientation(map_orientation);

    int offset = ((map_orientation / 2) + base.orientation) % 2;
    int image_id = base_img() + offset;
    map_building_tiles_add(id(), tile(), base.size, image_id, TERRAIN_BUILDING);
}

void building_tower_gatehouse::on_place_update_tiles(int map_orientation, int variant) {
    inherited::on_place_update_tiles(map_orientation, variant);

    update_map_orientation(map_orientation);
}

void building_tower_gatehouse::on_create(int map_orientation) {
    inherited::on_create(map_orientation);

    auto match = map_adjust_building_determine_orientation(base.tile, base.size, true, true, BUILDING_MUD_GATEHOUSE);
    base.orientation = (match.orientation == 0 || match.orientation == 2) ? 1 : 0;
}