#include "building_wharf.h"
#include "grid/orientation.h"

#include "grid/water.h"
#include "grid/building.h"
#include "graphics/graphics.h"
#include "graphics/image.h"

BUILDING_RUNTIME_DATA_IMPL(building_wharf)

void building_wharf::on_create(int orientation) {
    base.orientation = orientation;
}

void building_wharf::on_place(int orientation, int variant) {
    int orientation_rel = map_view_relative_orientation(orientation);
    map_water_add_building(id(), tile(), current_params().building_size, base_img() + orientation_rel);

    building_impl::on_place(orientation, variant);
}

void building_wharf::on_place_update_tiles(int orientation, int variant) {
    int orientation_rel = map_view_relative_orientation(orientation);
    map_water_add_building(id(), tile(), size(), base_img() + orientation_rel);
}

void building_wharf::update_map_orientation(int orientation) {
    int image_offset = map_view_relative_orientation(base.orientation);
    int image_id = base_img() + image_offset;
    map_water_add_building(id(), tile(), size(), image_id);
    // The animation is picked by the facing on the map: pick it again now, not at the next daily update.
    update_graphic();
}

void building_wharf::on_tick(bool refresh_only) {
    auto &anim_wharf = base.anim;
    auto &d = runtime_data();
    if (anim_wharf.valid()) {
        d.docker_anim_frame++;
        d.docker_anim_frame %= (anim_wharf.max_frames * anim_wharf.frame_duration);
    }
}

// Wharf groups mostly interleave four facings, one image each per frame (SprAmbient 46, 55), so frames step by four;
// a single-facing group (47, the transport and warship wharves' dock worker) sets frame_step 1, or the animation
// runs on into the next groups (the hulls and cargo after 47).
int building_wharf::anim_frame_offset(int docker_frame) const {
    const auto& a = base.anim;
    const int step = a.frame_step > 0 ? a.frame_step : 4;
    return (docker_frame / std::max<int>(1, a.frame_duration)) * step;
}

bool building_wharf::draw_ornaments_and_animations_height(painter &ctx, vec2i point, tile2i tile, color color_mask) {
    auto &anim_wharf = base.anim;
    auto &d = runtime_data();
    if (anim_wharf.valid()) {
        int img_id = anim_wharf.start_frame() + anim_frame_offset(d.docker_anim_frame);
        const image_t *img = image_get(img_id);
        auto& command = ImageDraw::create_subcommand(ctx, render_command_t::ert_generic);
        command.image_id = img_id;
        command.pixel = point + anim_wharf.pos;
        command.mask = color_mask;
        command.flags = ImgFlag_InternalOffset;
    }

    return true;
}
