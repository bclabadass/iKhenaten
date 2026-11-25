#include "building_stonemason_guild.h"

#include "building/building_statue.h"
#include "building/monuments.h"
#include "building/monument_pyramid_engine.h"
#include "figuretype/figure_stonemason.h"
#include "city/city.h"
#include "city/city_labor.h"
#include "core/calc.h"
#include "figure/figure.h"
#include "core/random.h"
#include "game/game_config.h"
#include "window/building/figures.h"
#include "sound/sound_building.h"
#include "widget/city/ornaments.h"
#include "game/game.h"
#include "js/js_register.h"

REPLICATE_STATIC_PARAMS_FROM_CONFIG(building_stonemason_guild);

bool building_stonemason_guild::can_spawn_stonemason_man() {
    return get_figures_number(FIGURE_STONEMASON) < current_params().max_walkers;
}

void building_stonemason_guild::spawn_figure() {
    check_labor_problem();
    if (!base.has_road_access) {
        return;
    }

    common_spawn_labor_seeker(current_params().min_houses_coverage);
    int pct_workers = base.worker_percentage();
    if (pct_workers < 50) {
        return;
    }

    int spawn_delay = figure_spawn_timer();
    if (spawn_delay == -1) {
        return;
    }

    base.figure_spawn_delay++;
    if (base.figure_spawn_delay < spawn_delay) {
        return;
    }

    base.figure_spawn_delay = 0;
    building* monument = buildings_valid_first([&] (building &b) {
        if (!b.is_main()) {
            return false;
        }

        if (!b.is_monument()) {
            return false;
        }

        auto monument = b.dcast_monument();
        if (!monument->is_unfinished()) {
            return false;
        }

        return monument->need_stonemason();
    });

    // A pyramid's course takes a mason on every free part, so the guild keeps sending them while it has one
    // (`need_stonemason`); other monuments and the statues get one mason at a time from each guild.
    const bool fills_course
      = monument && monument->dcast_pyramid() && g_monument_pyramid_engine.uses_block_engine(monument);
    if (!fills_course && !can_spawn_stonemason_man()) {
        return;
    }

    if (monument) {
        auto f = create_figure_with_destination(FIGURE_STONEMASON, monument, (e_figure_action)ACTION_0_MASON_CREATED, BUILDING_SLOT_SERVICE);
        // Set destination_tile before figures.update(): PREFER_ROADS can poof walkers
        // that are off-road with an empty destination_tile (same as artisans guild).
        auto *mm = monument->dcast_monument();
        f->destination_tile = mm ? mm->access_point() : monument->access_tile();
        f->terrain_usage = TERRAIN_USAGE_PREFER_ROADS;
        monument->dcast()->add_workers(f->id);
        f->wait_ticks = random_short() % 30; // ok
        // destination_bid so on_destroy clears the monument worker slot (same as statue path).
        if (auto mason = smart_cast<figure_stonemason>(f)) {
            mason->runtime_data().destination_bid = monument->id;
        }
        return;
    }

    if (!building_statue::guild_service_enabled()) {
        return;
    }

    // If no monument is found, create a stonemason figure with a statue destination
    int min_service_value = 9999;
    building_impl *min_service_statue = nullptr;
    buildings_valid_do([&] (building &b) {
        const auto statue = b.dcast_statue();
        if (!statue) {
            return;
        }

        const bool has_worker = statue->get_figure_id(BUILDING_SLOT_SERVICE) != 0;
        if (has_worker) {
            return;
        }

        const int value = statue->service();
        if (value < min_service_value) {
            min_service_value = value;
            min_service_statue = statue;
        }
    });

    if (min_service_statue) {
        auto f = create_figure_with_destination(FIGURE_STONEMASON, &min_service_statue->base, (e_figure_action)ACTION_11_MASON_CREATED_ROAMING, BUILDING_SLOT_SERVICE);
        min_service_statue->add_workers(f->id);
        f->wait_ticks = random_short() % 30;
        auto mason = smart_cast<figure_stonemason>(f);
        if (mason) {
            mason->runtime_data().destination_bid = min_service_statue->id();
        }
        return;
    }
}

