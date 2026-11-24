#pragma once

#include "building/building.h"

struct building_gatehouse_ghost {
    svector<vec2i, 8> main_view_offset;
    svector<vec2i, 8> part_view_offset;
};
ANK_CONFIG_STRUCT(building_gatehouse_ghost, main_view_offset, part_view_offset)

class building_gatehouse : public building_impl {
public:
    building_gatehouse(building &b) : building_impl(b) {}
    virtual building_gatehouse *dcast_gatehouse() override { return this; }

    struct gatehouse_params_t {
        building_gatehouse_ghost ghost;
    };

    virtual void on_create(int orientation) override;
    virtual void on_place_update_tiles(int orientation, int variant) override;
    virtual void on_place(int orientation, int variant) override;
    virtual void update_map_orientation(int orientation) override;

    struct back_tile_orientation {
        tile2i tile;
        int orientation;
    };
    static back_tile_orientation second_part_tile(tile2i end, int city_orientation);
    static void update_image_set(building &maingate);
    static void update_image_set(building &maingate, tile2i back_tile);
    static tile2i claim_2x2_footprint(building &part_a, building &part_b);

    virtual void spawn_figure() override;
};

class building_brick_gatehouse : public building_gatehouse {
public:
    BUILDING_METAINFO(BUILDING_BRICK_GATEHOUSE, building_brick_gatehouse, building_gatehouse)

    struct static_params : public gatehouse_params_t, public building_static_params {
    } BUILDING_STATIC_DATA_T;
};
ANK_CONFIG_STRUCT(building_brick_gatehouse::static_params, ghost)

class building_strong_gatehouse : public building_gatehouse {
public:
    BUILDING_METAINFO(BUILDING_GATEHOUSE, building_strong_gatehouse, building_gatehouse)

    struct static_params : public gatehouse_params_t, public building_static_params {
    } BUILDING_STATIC_DATA_T;
};
ANK_CONFIG_STRUCT(building_strong_gatehouse::static_params, ghost)

// The gatehouse a player builds, and the ones a map places on its walls: a 2x2 pylon, the 1x2 gate the road runs
// through and another 2x2 pylon along the wall line (5x2). The main building is the gate tile it was placed on; the
// other gate tile and the two pylons are its parts. orientation 0: the wall runs along x, 1: along y.
class building_gatehouse_5x2 : public building_impl {
public:
    building_gatehouse_5x2(building& b) : building_impl(b) {}

    struct layout_t {
        tile2i gate[2];
        tile2i pylon[2];
        int axis = 0;
    };
    static layout_t layout_at(tile2i gate, int axis);
    static bool layout_blocked(const layout_t& layout, blocked_tile_vec* blocked_tiles);
    static void refresh_images(building& main);
    static int pylon_image(e_building_type type, int frame);
    static int map_gatehouses_to_buildings();

    struct preview : public building_planer_renderer {
        virtual void collect_site(build_planner& p, tile2i end) const override;
        virtual void ghost_preview(build_planner& p, painter& ctx, tile2i tile, tile2i end, vec2i pixel) const override;
        virtual void ghost_blocked(build_planner& p, painter& ctx, tile2i tile, tile2i end, vec2i pixel,
          bool fully_blocked) const override;
        virtual int can_place(build_planner& p, tile2i tile, tile2i end, int state) const override;
        virtual int finalize_check(build_planner& p, tile2i tile, tile2i end, int state) const override;
    };

    virtual void on_create(int orientation) override;
    virtual void on_place(int orientation, int variant) override;
    virtual void on_place_update_tiles(int orientation, int variant) override;
    virtual void update_map_orientation(int orientation) override;
    virtual void spawn_figure() override;
    virtual bool draw_ornaments_and_animations_height(painter& ctx, vec2i point, tile2i tile, color mask) override;
};

class building_mud_gatehouse : public building_gatehouse_5x2 {
public:
    BUILDING_METAINFO(BUILDING_MUD_GATEHOUSE, building_mud_gatehouse, building_gatehouse_5x2)

    struct static_params : public building_static_params {
    } BUILDING_STATIC_DATA_T;
};

class building_decorative_gatehouse : public building_gatehouse_5x2 {
public:
    BUILDING_METAINFO(BUILDING_DECORATIVE_GATEHOUSE, building_decorative_gatehouse, building_gatehouse_5x2)

    struct static_params : public building_static_params {
    } BUILDING_STATIC_DATA_T;
};

class building_tower_gatehouse : public building_impl {
public:
    BUILDING_METAINFO(BUILDING_TOWER_GATEHOUSE, building_tower_gatehouse, building_impl)

    virtual void update_map_orientation(int orientation) override;
    virtual void on_place_update_tiles(int orientation, int variant) override;
    virtual void on_create(int orientation) override;
};
