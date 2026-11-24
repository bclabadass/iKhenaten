#include "building_temple_complex.h"
#include "building/building_temple_complex_upgrade.h"
#include "grid/orientation.h"

#include "city/city.h"
#include "figure/action.h"
#include "figure/figure.h"
#include "game/undo.h"
#include "game/game.h"
#include "game/game_events.h"
#include "grid/building_tiles.h"
#include "grid/terrain.h"
#include "grid/image.h"
#include "grid/tiles.h"
#include "grid/property.h"
#include "building/rotation.h"
#include "graphics/view/lookup.h"
#include "construction/build_planner.h"

#include <algorithm>
#include <limits>
#include "js/js_register.h"
#include "game/game_pool.h"

BUILDING_RUNTIME_DATA_IMPL(building_temple_complex)

building_temple_complex::decoraive_tiles_pool_t &building_temple_complex::get_decorative_tiles_pool() {
    static decoraive_tiles_pool_t _inst;
    return _inst;
}

tile2i building_part_offset(int orientation, int size) {
    tile2i offset = { 0, 0 };
    switch (orientation) {
    case 0: offset = { 0, -size }; break;
    case 1: offset = { size, 0 }; break;
    case 2: offset = { 0, size }; break;
    case 3: offset = { -size, 0 }; break;
    }

    return offset;
}

int building_temple_complex::preview::setup_orientation(int orientation) const { 
    return 1;
}

// The complex starts facing 1 and each rotation turns it a step. The planner passes its current orientation here,
// not the rotation: adding 1 to that started it at 2, and after R (which sets the orientation to the rotation) put it
// back where it was, so the Rotate button seemed to do nothing.
int building_temple_complex::preview::update_relative_orientation(build_planner &p, tile2i tile, int global_rotation) const {
    return (p.global_rotation + 1) % 4;
}

int building_temple_complex::preview::update_building_variant(build_planner &planer) const {
    // Match on_create: variant = (10 - 2*orientation) % 8 so resolve ? same complex orientation.
    return (10 - (2 * planer.absolute_orientation)) % 8;
}

void building_temple_complex::preview::setup_preview_graphics(build_planner &planer) const {
    const auto &params = building_static_params::get(planer.build_type);

    int EMPTY______ = 0;
    int back______1 = params.first_img("back_1");
    int back______0 = params.first_img("back_0");
    int middle____1 = params.first_img("middle_1");
    int middle____0 = params.first_img("middle_0");
    int front_____1 = params.first_img("front_1");
    int front_____0 = params.first_img("front_0");

    int tiles_____0 = params.first_img("tiles_0");
    int tiles_____1 = params.first_img("tiles_1");
    int tiles_____2 = params.first_img("tiles_2");
    int tiles_____3 = params.first_img("tiles_3");

    int statue1_image_id = params.first_img("statue_1");
    int statue____0 = statue1_image_id + 0; // north
    int statue____1 = statue1_image_id + 1; // east
    int statue____2 = statue1_image_id + 2; // south
    int statue____3 = statue1_image_id + 3; // west

    int statue2n = params.first_img("statue_2n");
    int statue_2n_F = statue2n + 0; // north
    int statue_2n_B = statue2n + 1;
    int statue2e = params.first_img("statue_2e");
    int statue_2e_A = statue2e + 0; // east
    int statue_2e_B = statue2e + 1;
    int statue2s = params.first_img("statue_2s");
    int statue_2s_A = statue2s + 0; // south
    int statue_2s_B = statue2s + 1;
    int statue2w = params.first_img("statue_2w");
    int statue_2w_A = statue2w + 0; // west
    int statue_2w_B = statue2w + 1;

    // clang-format off
    switch (planer.relative_orientation) {
    case 0:
        { // NE
            int TEMPLE_COMPLEX_SCHEME[13][7] = {
                {tiles_____3, statue_2e_A, statue_2e_B, tiles_____1, statue_2w_A, statue_2w_B, tiles_____3},
                {tiles_____2, statue_2e_A, statue_2e_B, tiles_____1, statue_2w_A, statue_2w_B, tiles_____2},
                {tiles_____3, statue_2e_A, statue_2e_B, tiles_____1, statue_2w_A, statue_2w_B, tiles_____3},
                {tiles_____2, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____2},
                {tiles_____0, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, tiles_____0},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {statue____3, tiles_____0, back______0, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {tiles_____1, tiles_____1, EMPTY______, EMPTY______, EMPTY______, tiles_____1, tiles_____1},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {statue____3, tiles_____0, middle____0, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {tiles_____1, tiles_____1, EMPTY______, EMPTY______, EMPTY______, tiles_____1, tiles_____1},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {statue____3, tiles_____0, front_____0, EMPTY______, EMPTY______, tiles_____0, statue____1},
            };
            planer.set_graphics_array(make_span((int*)TEMPLE_COMPLEX_SCHEME, std::size(TEMPLE_COMPLEX_SCHEME)), vec2i(7, 13));
            planer.pivot = { 2, 10 };
        }
        break;

    case 1:
        { // SE
            int TEMPLE_COMPLEX_SCHEME[7][13] = {
                {statue____0, statue____0, tiles_____1, statue____0, statue____0, tiles_____1, statue____0, statue____0, tiles_____0, tiles_____2, tiles_____3, tiles_____2, tiles_____3},
                {tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____0, tiles_____0, statue_2s_B, statue_2s_B, statue_2s_B},
                {EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue_2s_A, statue_2s_A, statue_2s_A},
                {EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, tiles_____1, tiles_____1, tiles_____1, tiles_____1},
                {back______1, EMPTY______, EMPTY______, middle____1, EMPTY______, EMPTY______, front_____1, EMPTY______, EMPTY______, tiles_____0, statue_2n_B, statue_2n_B, statue_2n_B},
                {tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____0, tiles_____0, statue_2n_F, statue_2n_F, statue_2n_F},
                {statue____2, statue____2, tiles_____1, statue____2, statue____2, tiles_____1, statue____2, statue____2, tiles_____0, tiles_____2, tiles_____3, tiles_____2, tiles_____3},
            };
            planer.set_graphics_array(make_span((int*)TEMPLE_COMPLEX_SCHEME, std::size(TEMPLE_COMPLEX_SCHEME)), vec2i(13, 7));
            planer.pivot = { 0, 2 };
        }
        break;

    case 2:
        { // SW
            int TEMPLE_COMPLEX_SCHEME[13][7] = {
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {tiles_____1, tiles_____1, back______0, EMPTY______, EMPTY______, tiles_____1, tiles_____1},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {tiles_____1, tiles_____1, middle____0, EMPTY______, EMPTY______, tiles_____1, tiles_____1},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {statue____3, tiles_____0, EMPTY______, EMPTY______, EMPTY______, tiles_____0, statue____1},
                {tiles_____0, tiles_____0, front_____0, EMPTY______, EMPTY______, tiles_____0, tiles_____0},
                {tiles_____2, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____2},
                {tiles_____3, statue_2e_A, statue_2e_B, tiles_____1, statue_2w_A, statue_2w_B, tiles_____3},
                {tiles_____2, statue_2e_A, statue_2e_B, tiles_____1, statue_2w_A, statue_2w_B, tiles_____2},
                {tiles_____3, statue_2e_A, statue_2e_B, tiles_____1, statue_2w_A, statue_2w_B, tiles_____3},
            };
            planer.set_graphics_array(make_span((int*)TEMPLE_COMPLEX_SCHEME, std::size(TEMPLE_COMPLEX_SCHEME)), vec2i(7, 13));
            planer.pivot = { 2, 0 };
        }
    break;

    case 3:
        { // NW
            int TEMPLE_COMPLEX_SCHEME[7][13] = {
                {tiles_____3, tiles_____2, tiles_____3, tiles_____2, tiles_____0, statue____0, statue____0, tiles_____1, statue____0, statue____0, tiles_____1, statue____0, statue____0},
                {statue_2s_B, statue_2s_B, statue_2s_B, tiles_____0, tiles_____0, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0},
                {statue_2s_A, statue_2s_A, statue_2s_A, tiles_____0, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______},
                {tiles_____1, tiles_____1, tiles_____1, tiles_____1, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______},
                {statue_2n_B, statue_2n_B, statue_2n_B, tiles_____0, back______1, EMPTY______, EMPTY______, middle____1, EMPTY______, EMPTY______, front_____1, EMPTY______, EMPTY______},
                {statue_2n_F, statue_2n_F, statue_2n_F, tiles_____0, tiles_____0, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0, tiles_____1, tiles_____0, tiles_____0},
                {tiles_____3, tiles_____2, tiles_____3, tiles_____2, tiles_____0, statue____2, statue____2, tiles_____1, statue____2, statue____2, tiles_____1, statue____2, statue____2},
            };
            planer.set_graphics_array(make_span((int*)TEMPLE_COMPLEX_SCHEME, std::size(TEMPLE_COMPLEX_SCHEME)), vec2i(13, 7));
            planer.pivot = { 10, 2 };
        }
        break;
    }
    // clang-format on
}

void building_temple_complex::map_add_tiles(e_building_type type, tile2i north_tile, int orientation, building_temple_complex::decoraive_tiles_t& tiles_list) {
    tiles_list.clear();

    int packid = -1;
    switch (type) {
    case BUILDING_TEMPLE_COMPLEX_OSIRIS: packid = PACK_TEMPLE_NILE; break;
    case BUILDING_TEMPLE_COMPLEX_RA: packid = PACK_TEMPLE_RA; break;
    case BUILDING_TEMPLE_COMPLEX_PTAH: packid = PACK_TEMPLE_PTAH; break;
    case BUILDING_TEMPLE_COMPLEX_SETH: packid = PACK_TEMPLE_SETH; break;
    case BUILDING_TEMPLE_COMPLEX_BAST: packid = PACK_TEMPLE_BAST; break;
        break;
    }

    int flooring_image_id = image_id_from_group(packid, 4);
    int statue1_image_id = image_id_from_group(packid, 5);
    int statue2_image_id = image_id_from_group(packid, 6);

    constexpr int EMPTY______ = std::numeric_limits<int>::min();

    // floor tiles
    int til_0 = flooring_image_id + 0;
    int til_1 = flooring_image_id + 1;
    int til_2 = flooring_image_id + 2;
    int til_3 = flooring_image_id + 3;

    // small (1x1) statues
    int smst0 = statue1_image_id + (4 - map_view_orientation() / 2) % 4; // north
    int smst1 = statue1_image_id + (5 - map_view_orientation() / 2) % 4; // east
    int smst2 = statue1_image_id + (6 - map_view_orientation() / 2) % 4; // south
    int smst3 = statue1_image_id + (7 - map_view_orientation() / 2) % 4; // west

    // long (1x2) statues
    int lst0B = statue2_image_id + (8 - map_view_orientation()) % 8; // north
    int lst0A = statue2_image_id + (9 - map_view_orientation()) % 8;
    int lst1B = statue2_image_id + (10 - map_view_orientation()) % 8; // east
    int lst1A = statue2_image_id + (11 - map_view_orientation()) % 8;
    int lst2B = statue2_image_id + (12 - map_view_orientation()) % 8; // south
    int lst2A = statue2_image_id + (13 - map_view_orientation()) % 8;
    int lst3B = statue2_image_id + (14 - map_view_orientation()) % 8; // west
    int lst3A = statue2_image_id + (15 - map_view_orientation()) % 8;

    // correct long statues graphics for relative orientation
    switch (map_view_orientation() / 2) {
    case 1:
    case 0:
        lst1A = statue2_image_id + (10 - map_view_orientation()) % 8; // east
        lst1B = statue2_image_id + (11 - map_view_orientation()) % 8;
        lst3A = statue2_image_id + (14 - map_view_orientation()) % 8; // west
        lst3B = statue2_image_id + (15 - map_view_orientation()) % 8;
        break;
    }
    switch (map_view_orientation() / 2) {
    case 3:
    case 0:
        lst0A = statue2_image_id + (8 - map_view_orientation()) % 8; // north
        lst0B = statue2_image_id + (9 - map_view_orientation()) % 8;
        lst2A = statue2_image_id + (12 - map_view_orientation()) % 8; // south
        lst2B = statue2_image_id + (13 - map_view_orientation()) % 8;
        break;
    }

    // adjust northern tile offset
    switch (orientation) {
    case 0: // NE
        north_tile.shift(-2, -10);
        //            north_tile.x -= 2;
        //            north_tile.y -= 10;
        break;
    case 1: // SE
        north_tile.shift(0, -2);
        //            north_tile.y -= 2;
        break;
    case 2: // SW
        north_tile.shift(-2, 0);
        //            north_tile.x -= 2;
        break;
    case 3: // NW
        north_tile.shift(-10, -2);
        //            north_tile.x -= 10;
        //            north_tile.y -= 2;
        break;
    }

    // first, add base tiles
    switch (orientation) {
    case 0:
    { // NE
        int TEMPLE_COMPLEX_SCHEME[13][7] = {
          {til_3, lst1A, lst1B, til_1, lst3A, lst3B, til_3},
          {til_2, lst1A, lst1B, til_1, lst3A, lst3B, til_2},
          {til_3, lst1A, lst1B, til_1, lst3A, lst3B, til_3},
          {til_2, til_0, til_0, til_1, til_0, til_0, til_2},
          {til_0, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, til_0},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {til_1, til_1, EMPTY______, EMPTY______, EMPTY______, til_1, til_1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {til_1, til_1, EMPTY______, EMPTY______, EMPTY______, til_1, til_1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
        };
        for (int row = 0; row < 13; row++) {
            for (int column = 0; column < 7; column++) {
                tile2i current_tile = north_tile.shifted(column, row);
                int image_id = TEMPLE_COMPLEX_SCHEME[row][column];
                if (image_id != EMPTY______) {
                    map_image_set(current_tile, image_id);
                    tiles_list.push_back(current_tile.grid_offset());
                }
            }
        }
        break;
    }
    case 1:
    { // SE
        int TEMPLE_COMPLEX_SCHEME[7][13] = {
          {smst0, smst0, til_1, smst0, smst0, til_1, smst0, smst0, til_0, til_2, til_3, til_2, til_3},
          {til_0, til_0, til_1, til_0, til_0, til_1, til_0, til_0, til_0, til_0, lst2B, lst2B, lst2B},
          {EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, til_0, lst2A, lst2A, lst2A},
          {EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, til_1, til_1, til_1, til_1},
          {EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, til_0, lst0B, lst0B, lst0B},
          {til_0, til_0, til_1, til_0, til_0, til_1, til_0, til_0, til_0, til_0, lst0A, lst0A, lst0A},
          {smst2, smst2, til_1, smst2, smst2, til_1, smst2, smst2, til_0, til_2, til_3, til_2, til_3},
        };
        for (int row = 0; row < 7; row++) {
            for (int column = 0; column < 13; column++) {
                tile2i current_tile = north_tile.shifted(column, row);
                int image_id = TEMPLE_COMPLEX_SCHEME[row][column];
                if (image_id != EMPTY______) {
                    map_image_set(current_tile, image_id);
                    tiles_list.push_back(current_tile.grid_offset());
                }
            }
        }
        break;
    }
    case 2:
    { // SW
        int TEMPLE_COMPLEX_SCHEME[13][7] = {
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {til_1, til_1, EMPTY______, EMPTY______, EMPTY______, til_1, til_1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {til_1, til_1, EMPTY______, EMPTY______, EMPTY______, til_1, til_1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {smst3, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, smst1},
          {til_0, til_0, EMPTY______, EMPTY______, EMPTY______, til_0, til_0},
          {til_2, til_0, til_0, til_1, til_0, til_0, til_2},
          {til_3, lst1A, lst1B, til_1, lst3A, lst3B, til_3},
          {til_2, lst1A, lst1B, til_1, lst3A, lst3B, til_2},
          {til_3, lst1A, lst1B, til_1, lst3A, lst3B, til_3},
        };
        for (int row = 0; row < 13; row++) {
            for (int column = 0; column < 7; column++) {
                tile2i current_tile = north_tile.shifted(column, row);
                int image_id = TEMPLE_COMPLEX_SCHEME[row][column];
                if (image_id != EMPTY______) {
                    map_image_set(current_tile, image_id);
                    tiles_list.push_back(current_tile.grid_offset());
                }
            }
        }
        break;
    }
    case 3:
    { // NW
        int TEMPLE_COMPLEX_SCHEME[7][13] = {
          {til_3, til_2, til_3, til_2, til_0, smst0, smst0, til_1, smst0, smst0, til_1, smst0, smst0},
          {lst2B, lst2B, lst2B, til_0, til_0, til_0, til_0, til_1, til_0, til_0, til_1, til_0, til_0},
          {lst2A, lst2A, lst2A, til_0, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______},
          {til_1, til_1, til_1, til_1, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______},
          {lst0B, lst0B, lst0B, til_0, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______, EMPTY______},
          {lst0A, lst0A, lst0A, til_0, til_0, til_0, til_0, til_1, til_0, til_0, til_1, til_0, til_0},
          {til_3, til_2, til_3, til_2, til_0, smst2, smst2, til_1, smst2, smst2, til_1, smst2, smst2},
        };
        for (int row = 0; row < 7; row++) {
            for (int column = 0; column < 13; column++) {
                tile2i current_tile = north_tile.shifted(column, row);
                int image_id = TEMPLE_COMPLEX_SCHEME[row][column];
                if (image_id != EMPTY______) {
                    map_image_set(current_tile, image_id);
                    tiles_list.push_back(current_tile.grid_offset());
                }
            }
        }
        break;
    }
    }
}

REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_osiris);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_ra);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_ptah);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_seth);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_bast);

void building_temple_complex::on_create(int orientation) {
    runtime_data().variant = (10 - (2 * orientation)) % 8; // ugh!
    runtime_data().decorative_tiles = get_decorative_tiles_pool().allocate();
    g_city.buildings.track_building(base, false);
}

// Ra, Ptah and Osiris had each other's altar and oracle (Osiris got Amon and Thoth, which are Ptah's), and a complex
// keeps the part types it was built with: a save from then holds the old ones, which get_altar/get_oracle no longer
// find.
void building_temple_complex::retype_upgrade_parts() {
    const auto& params = base_params();
    for (building* part = base.has_next() ? base.next() : nullptr; part;
      part = part->has_next() ? part->next() : nullptr) {
        e_building_type wanted = BUILDING_NONE;
        if (part->dcast()->dcast_temple_complex_altar() && !building_type_any_of(part->type, params.allowed_altar)) {
            wanted = params.allowed_altar.front();
        } else if (
          part->dcast()->dcast_temple_complex_oracle() && !building_type_any_of(part->type, params.allowed_oracle)) {
            wanted = params.allowed_oracle.front();
        }
        if (wanted != BUILDING_NONE) {
            part->clear_impl();
            part->set_type(wanted);
        }
    }
}

void building_temple_complex::on_post_load() {
    building_impl::on_post_load();
    if (is_main()) {
        retype_upgrade_parts();
    }

    const bool is_active = num_workers() > 0;
    g_city.buildings.track_building(base, is_active);

    // save decorative tiles to runtime_data
    const int city_orientation = map_view_orientation() / 2;
    runtime_data().decorative_tiles = get_decorative_tiles_pool().allocate();
    update_map_orientation(city_orientation);
}

building *add_temple_complex_element(tile2i tile, e_building_type type, int orientation, building *prev) {
    building *b = building_create(type, tile, orientation);
    game_undo_add_building(b);

    b->size = 3;
    b->prev_part_building_id = prev->id;
    prev->next_part_building_id = b->id;
    int image_id = map_image_at(tile);
    map_building_tiles_add(b->id, b->tile, 3, image_id, TERRAIN_BUILDING);

    return b;
}

void building_temple_complex::on_place(int orientation, int variant) {
    building_impl::on_place(orientation, variant);

    auto& decorative_tiles = *runtime_data().decorative_tiles;
    map_add_tiles(type(), tile(), orientation, decorative_tiles);
    for (int grid_offset : decorative_tiles) {
        map_building_tiles_add(id(), tile2i(grid_offset), 1, map_image_at(grid_offset), TERRAIN_BUILDING);
    }

    tile2i offset = building_part_offset(orientation, 3);

    building *altar = add_temple_complex_element(tile().shifted(offset), base_params().allowed_altar.front(), orientation, &base);
    building *oracle = add_temple_complex_element(tile().shifted(offset * 2), base_params().allowed_oracle.front(), orientation, altar);

    // save decorative tiles to runtime_data
    update_map_orientation(orientation);
}

void building_temple_complex::bind_dynamic(io_buffer *iob, size_t version) {
    auto &d = runtime_data();

    iob->bind(BIND_SIGNATURE_UINT8, &base.orientation);
    iob->bind(BIND_SIGNATURE_UINT8, &d.temple_complex_upgrades);
    iob->bind(BIND_SIGNATURE_UINT8, &d.variant);
}

void building_temple_complex::build_upgrade(e_temple_compex_upgrade upgrade_param, e_building_type btype) {
    auto &d = runtime_data();
    d.temple_complex_upgrades |= upgrade_param;
    refresh_part_images();
}

static building* temple_complex_find_part(const building& base, const svector<e_building_type, 4>& allowed) {
    int next_id = base.next_part_building_id;
    for (int guard = 0; next_id > 0 && next_id < (int)MAX_BUILDINGS && guard < (int)MAX_BUILDINGS; ++guard) {
        building* next = building_get(next_id);
        if (building_type_any_of(next->type, allowed)) {
            return next;
        }
        next_id = next->next_part_building_id;
    }

    return nullptr;
}

void building_temple_complex::spawn_figure() {
    if (!is_main()) {
        return;
    }
    building_impl::spawn_figure();
}

building* building_temple_complex::get_altar() const {
    return temple_complex_find_part(base, base_params().allowed_altar);
}

building* building_temple_complex::get_oracle() const {
    return temple_complex_find_part(base, base_params().allowed_oracle);
}

building *building_temple_complex::get_upgrade(e_temple_compex_upgrade type) const {
    if (type == etc_upgrade_altar) {
        return get_altar();
    }

    if (type == etc_upgrade_oracle) {
        return get_oracle();
    }

    return &base;
}

void building_temple_complex::update_map_orientation(int orientation) {
    if (!is_main()) {
        return;
    }

    map_add_tiles(type(), tile(), facing(), *runtime_data().decorative_tiles);
    refresh_part_images();
}

int building_temple_complex::facing() const {
    return (5 - (runtime_data().variant / 2)) % 4;
}

// The pack draws the complex by depth, not by part: its tall temple ("BACK") goes on the part farthest from the
// camera, the colonnade ("MIDD") in the middle and the shrine ("FRONT") on the nearest part, each in two frames (one
// per axis). A built oracle changes the colonnade and a built altar the shrine: Sebek's crocodiles and Isis flank the
// shrine's door, Min and Hathor stand in the colonnade.
building_temple_complex::part_images_t building_temple_complex::part_images() const {
    part_images_t images;
    const int axis = (facing() + map_view_orientation() / 2) % 2;
    static const xstring back[2] = {"back_0", "back_1"};
    static const xstring middle[2] = {"middle_0", "middle_1"};
    static const xstring front[2] = {"front_0", "front_1"};
    static const xstring altar[2] = {"altar_0", "altar_1"};
    static const xstring oracle[2] = {"oracle_0", "oracle_1"};
    const auto& params = current_params();

    building* parts[3] = {&base, get_altar(), get_oracle()};
    if (!parts[1] || !parts[2]) {
        images.parts.push_back({&base, params.first_img(back[axis])});
        return images;
    }

    std::sort(std::begin(parts), std::end(parts), [](building* a, building* b) {
        return map_view_tile_depth(a->tile.shifted(1, 1)) < map_view_tile_depth(b->tile.shifted(1, 1));
    });
    const int middle_image = params.first_img(has_upgrade(etc_upgrade_oracle) ? oracle[axis] : middle[axis]);
    const int front_image = params.first_img(has_upgrade(etc_upgrade_altar) ? altar[axis] : front[axis]);
    images.parts.push_back({parts[0], params.first_img(back[axis])});
    images.parts.push_back({parts[1], middle_image});
    images.parts.push_back({parts[2], front_image});
    images.altar = {parts[2], params.first_img(altar[axis])};
    images.oracle = {parts[1], params.first_img(oracle[axis])};
    return images;
}

void building_temple_complex::refresh_part_images() {
    for (const part_image_t& part : part_images().parts) {
        map_building_tiles_add(part.b->id, part.b->tile, 3, part.image_id, TERRAIN_BUILDING);
    }
}

void building_temple_complex::update_count() const {
    const bool is_active = num_workers() > 0;
    g_city.buildings.track_building(base, is_active);
}

void building_temple_complex::on_destroy() {
    auto &tiles = *runtime_data().decorative_tiles;
    if (is_main() && !tiles.empty()) {
        // Per-tile reset matches what map_building_tiles_remove() does for a
        // building's footprint � without it the decorative sprites stay drawn
        // and the cursor-to-building grid keeps stale ids on those tiles.
        for (auto &t : tiles) {
            map_building_tile_clear_at(t, /*building_type*/ 0);
        }

        tile2i first(tiles[0]);
        int xmin = first.x(), xmax = xmin;
        int ymin = first.y(), ymax = ymin;
        for (auto &t : tiles) {
            tile2i tp(t);
            xmin = std::min(xmin, tp.x());
            xmax = std::max(xmax, tp.x());
            ymin = std::min(ymin, tp.y());
            ymax = std::max(ymax, tp.y());
        }
        map_tiles_update_region_empty_land(true,
            tile2i(xmin - 2, ymin - 2),
            tile2i(xmax + 2, ymax + 2));
    }

    get_decorative_tiles_pool().destroy(runtime_data().decorative_tiles);
    runtime_data().decorative_tiles = nullptr;
}
