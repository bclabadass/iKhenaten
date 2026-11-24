#include "building_temple_complex_upgrade.h"
#include "graphics/view/view.h"
#include "grid/orientation.h"

#include "grid/building_tiles.h"
#include "grid/terrain.h"
#include "graphics/view/lookup.h"
#include "construction/build_planner.h"
#include "city/city_buildings.h"
#include "building/building_temple_complex.h"
#include "building/rotation.h"
#include "js/js_register.h"

REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_altar_amon);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_oracle_thoth);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_altar_anubis);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_oracle_sekhmet);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_altar_sebek);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_oracle_min);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_altar_maat);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_oracle_horus);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_altar_isis);
REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_temple_complex_oracle_hathor);

namespace {

    building_temple_complex* complex_at(tile2i tile) {
        building* b = building_at(tile);
        return b ? b->main()->dcast_temple_complex() : nullptr;
    }

    void draw_upgrade_ghost(painter& ctx, tile2i end, e_temple_compex_upgrade upgrade) {
        auto complex = complex_at(end);
        if (!complex) {
            return;
        }
        const auto images = complex->part_images();
        const auto& part = upgrade == etc_upgrade_altar ? images.altar : images.oracle;
        if (!part.b) {
            return;
        }
        const vec2i pixel = g_camera.lookup_tile_to_pixel(map_view_draw_tile(part.b->tile, 3));
        ghost_draw::draw_building_ghost(ctx, part.image_id, pixel);
    }

    int place_upgrade(build_planner& p, tile2i end, e_temple_compex_upgrade upgrade) {
        auto complex = complex_at(end);
        if (!complex || complex->has_upgrade(upgrade)) {
            return false;
        }
        complex->build_upgrade(upgrade, p.build_type);
        return true;
    }

    void refresh_complex(building& part) {
        if (auto complex = part.main()->dcast_temple_complex()) {
            complex->refresh_part_images();
        }
    }

} // namespace

void building_temple_complex_altar::preview::ghost_preview(build_planner& planer, painter& ctx, tile2i tile, tile2i end,
  vec2i pixel) const {
    draw_upgrade_ghost(ctx, end, etc_upgrade_altar);
}

int building_temple_complex_altar::preview::construction_place(build_planner& p, tile2i tile, tile2i end,
  int orientation, int variant) const {
    return place_upgrade(p, end, etc_upgrade_altar);
}

void building_temple_complex_oracle::preview::ghost_preview(build_planner& planer, painter& ctx, tile2i tile,
  tile2i end, vec2i pixel) const {
    draw_upgrade_ghost(ctx, end, etc_upgrade_oracle);
}

int building_temple_complex_oracle::preview::construction_place(build_planner& p, tile2i tile, tile2i end,
  int orientation, int variant) const {
    return place_upgrade(p, end, etc_upgrade_oracle);
}

void building_temple_complex_altar::update_map_orientation(int orientation) {
    refresh_complex(base);
}

void building_temple_complex_oracle::update_map_orientation(int orientation) {
    refresh_complex(base);
}
