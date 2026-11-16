#include "building_transport_wharf.h"

#include "city/city.h"
#include "city/city_figures.h"
#include "figure/figure.h"
#include "grid/water.h"
#include "js/js_game.h"

REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_transport_wharf);

void building_transport_wharf::clear_invalid_boat() {
    // OG spawn_wharf: drop ship_id when the figure is dead or not a transport ship.
    const int boat_id = base.get_figure_id(BUILDING_SLOT_BOAT);
    if (!boat_id) {
        return;
    }

    figure *boat = figure_get(boat_id);
    if (!boat->is_valid() || boat->type != FIGURE_TRANSPORT_SHIP) {
        base.set_figure(BUILDING_SLOT_BOAT, 0);
    }
}

void building_transport_wharf::spawn_figure() {
    // OG: mark_problem + clear stale boat + labor seeker when houses_covered < 51.
    check_labor_problem();
    clear_invalid_boat();

    if (has_road_access()) {
        common_spawn_labor_seeker(current_params().min_houses_coverage);
    }
}

void building_transport_wharf::update_day() {
    building_wharf::update_day();
    clear_invalid_boat();
}

void building_transport_wharf::update_month() {
    building_wharf::update_month();
    map_water_update_docking_points(base, get_orientation(), 2);
}

// The ship gives up the wharf's slot whenever it is off the berth tile (update_dock): sailing, holding elsewhere,
// or docked a tile off. It is still this wharf's ship.
bool building_transport_wharf::has_own_ship() const {
    if (get_figure(BUILDING_SLOT_BOAT)->is_valid()) {
        return true;
    }
    bool found = false;
    figure_valid_do([&](figure& f) {
        if (f.type == FIGURE_TRANSPORT_SHIP && f.is_alive() && f.homeID() == id()) {
            found = true;
        }
    });
    return found;
}

// OG shipwright_boat_needed counts staffed transport wharves without a live boat, recounted each day; the
// request used to be added every month and kept, so a wharf whose ship was away ordered ships for good.
void building_transport_wharf::update_count() const {
    building_wharf::update_count();
    if (num_workers() > 0 && base.has_open_water_access && !has_own_ship()) {
        g_city.buildings.request_transport_ship();
    }
}

// The berth isn't saved; without it until the month's update a docked ship gave up the slot after every load.
void building_transport_wharf::on_post_load() {
    building_wharf::on_post_load();
    if (base.has_open_water_access) {
        set_water_access_tiles(map_water_get_access_points(base, get_orientation(), 2));
    }
}

void building_transport_wharf::on_undo() {
    base.set_figure(BUILDING_SLOT_BOAT, 0);
}
