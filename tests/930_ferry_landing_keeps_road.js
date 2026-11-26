// Labor seekers died at ferry landings and never reached the houses (Brendan, 2026-11-25, Meidum 1: "the job
// recruiter walkers are dropping dead when contacting a ferry landing and none of them can reach the housing").
// On every load (and rotation) the landing was redrawn with map_water_add_building alone, which clears its land
// tiles' road: the road stayed on the water tiles only, buildings took their road access there and roamers walked
// onto it and drowned. Roamers now also keep off landings (a dead end at the water, like a gatehouse).
// Part 1 (no data): a placed ferry pair keeps road on all its tiles through a save round trip.
// Part 2 (the Duo save in the Pharaoh folder's Save/DuoSaves/, else skipped): no labor seeker dies on Meidum 1 in
// 30 days once the ones the save left on the water have gone.
// Part 3 (campaign data): Menat Khufu's prebuilt landing lost its road on the mission's first load, its houses
// counted as cut off from the Kingdom Road and all were removed on day 8 (Brendan: "a ferry landing on the original
// map seems to be laid out incorrectly and there is not a link to the kingdom road"). They stay for 12 days.
// Markers:
//   [test-marker] t930_landing_road_after_load
//   [test-marker] t930_no_seeker_deaths
//   [test-marker] t930_save_skipped
//   [test-marker] t930_menat_khufu_houses_stay
//   [test-marker] t930_campaign_skipped

function t930_landing_tiles_without_road(bid) {
    var t = __building_tile(bid), missing = []
    for (var dy = 0; dy < 2; dy++) {
        for (var dx = 0; dx < 2; dx++) {
            var p = { x: t.x + dx, y: t.y + dy }
            if (!__map_terrain_is(p, TERRAIN_ROAD)) {
                missing.push(p.x + ',' + p.y)
            }
        }
    }
    return missing
}

function t930_houses() {
    var n = 0
    for (var b = 1; b < 4000; b++) {
        var t = __building_type(b)
        if (t >= BUILDING_HOUSE_VACANT_LOT && t <= BUILDING_HOUSE_PALATIAL_ESTATE && city.get_building(b).state == 1) {
            n++
        }
    }
    return n
}

function t930_menat_khufu() {
    if (!__game_has_campaign_data() || !__test_resolve_path('mission1.pak')) {
        __log_marker('t930_campaign_skipped')
        return
    }
    __game_load_mission(26, 1)
    __test_pump_frames(2)
    var start = t930_houses(), least = start
    for (var d = 0; d < 12; d++) {
        __test_run_ticks(50)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
        least = Math.min(least, t930_houses())
    }
    __log_info_native('[test:930] Menat Khufu: houses at start ' + start + ', fewest in 12 days ' + least)
    if (start > 0 && least == start) {
        __log_marker('t930_menat_khufu_houses_stay')
    }
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(10000)
    __scenario_building_allow(BUILDING_FERRY, true)
    var pair = test_ferry_pair_place()
    if (pair) {
        __test_save_roundtrip('t930')
        __test_pump_frames(2)
        var missing = t930_landing_tiles_without_road(pair.first).concat(t930_landing_tiles_without_road(pair.second))
        __log_info_native('[test:930] ferry pair ' + pair.first + ',' + pair.second + ' tiles without road after load: ['
            + missing.join(' ') + ']')
        if (missing.length == 0) {
            __log_marker('t930_landing_road_after_load')
        }
    }

    t930_menat_khufu()

    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Meidum 1.svx')) {
        __log_marker('t930_save_skipped')
        __test_signal_ready()
        return
    }
    __test_pump_frames(2)
    var seen = {}, deaths = [], seekers = 0
    for (var tick = 0; tick < 50 * 30; tick++) {
        __test_run_ticks(1)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
        for (var j = 1; j < 3000; j++) {
            var f = city.get_figure(j)
            if (!f || !f.valid || f.type != FIGURE_LABOR_SEEKER) {
                delete seen[j]
                continue
            }
            if (!seen[j]) {
                seen[j] = { dead: false }
                seekers++
            }
            if (f.action_state == 149 && !seen[j].dead) {
                seen[j].dead = true
                if (tick >= 50) {
                    var t = __figure_get_tile(j)
                    deaths.push(j + '@' + t.x + ',' + t.y + ' tick ' + tick)
                }
            }
        }
    }
    __log_info_native('[test:930] Meidum 1: ' + seekers + ' labor seekers, deaths after the first 50 ticks: '
        + deaths.length + ' [' + deaths.slice(0, 8).join(' | ') + ']')
    if (seekers > 0 && deaths.length == 0) {
        __log_marker('t930_no_seeker_deaths')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t930_landing_road_after_load')
        && (__test_find_inlog('[test-marker] t930_no_seeker_deaths') || __test_find_inlog('[test-marker] t930_save_skipped'))
        && (__test_find_inlog('[test-marker] t930_menat_khufu_houses_stay')
            || __test_find_inlog('[test-marker] t930_campaign_skipped'))
}
