// Laborers drowned on the way to a monument across the river (Brendan, Meidum 3: "laborers from work camps attempt
// to walk directly to pyramid (across the nile) and die upon hitting the coast. They should take the ferry").
// Two causes: a laborer sent to level the site walked cross-country from the work camp road straight to its tile
// (OG), into the river; it now takes the roads and the ferry when that line crosses water. And a walker queued at a
// ferry landing stopped with DIR_FIGURE_NONE, which do_goto read as arrival: the next action replaced the ferry wait,
// so the boat never took it and the laborer, "at the site", set off cross-country from the landing.
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t935_laborers_cross_by_ferry
//   [test-marker] t935_save_skipped

function t935_run() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Meidum 3.svx')) {
        __log_marker('t935_save_skipped')
        return true
    }
    __test_pump_frames(2)
    var mon = 0
    for (var b = 1; b < 4000 && !mon; b++) {
        if (__building_type(b) == BUILDING_STEPPED_PYRAMID_COMPLEX && __building_main_id(b) == b) {
            mon = b
        }
    }
    if (!mon) {
        __log_info_native('[test:935] no stepped pyramid complex in Meidum 3')
        return false
    }

    var counted = {}
    var drowned = 0
    var rode = {}
    var levelling = 0
    for (var tick = 0; tick < 1600; tick++) {
        __test_run_ticks(1)
        for (var f = 1; f < 3000; f++) {
            var fig = city.get_figure(f)
            if (!fig || !fig.valid || fig.type != FIGURE_LABORER) {
                continue
            }
            var a = __test_figure_get_action(f)
            if (fig.destination_building_id == mon && a == ACTION_6_CARTPUSHER_ON_FERRY) {
                rode[f] = true
            }
            if (a == ACTION_22_LABORER_LEVEL_WORK && __building_main_id(__building_at(__test_figure_tile_x(f), __test_figure_tile_y(f))) == mon) {
                levelling++
            }
            // The save starts with one laborer already dying in the river; count only deaths in this run.
            if (tick > 0 && __test_figure_is_dying(f) && fig.destination_building_id == mon && !counted[f]) {
                counted[f] = true
                drowned++
                __log_info_native('[test:935] laborer ' + f + ' died at ' + __test_figure_tile_x(f) + ',' + __test_figure_tile_y(f))
            }
            if (tick == 0 && __test_figure_is_dying(f)) {
                counted[f] = true
            }
        }
    }
    var riders = Object.keys(rode).length
    __log_info_native('[test:935] complex ' + mon + ': ' + drowned + ' laborers died on the way, ' + riders + ' rode the ferry, '
        + levelling + ' laborer-ticks levelling on the site')
    return drowned == 0 && riders > 0 && levelling > 0
}

function run_test() {
    if (t935_run() && !__test_find_inlog('[test-marker] t935_save_skipped')) {
        __log_marker('t935_laborers_cross_by_ferry')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t935_laborers_cross_by_ferry') || __test_find_inlog('[test-marker] t935_save_skipped')
}
