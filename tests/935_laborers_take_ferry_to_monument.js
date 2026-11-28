// Laborers drowned on the way to a monument across the river (Brendan, Meidum 3: "laborers from work camps attempt
// to walk directly to pyramid (across the nile) and die upon hitting the coast. They should take the ferry").
// A laborer sent to level the site walked cross-country from the work camp road straight to its tile (OG), into the
// river; it now takes the roads and the ferry when that line crosses water. A walker queued at a ferry landing
// stopped with DIR_FIGURE_NONE, which do_goto read as arrival: the next action replaced the ferry wait, so the boat
// never took it and the laborer, "at the site", set off cross-country from the landing.
// Then (Brendan, build 14278: "a few laborers still continue to cross across the river directly but now they no
// longer fail"): a new do_goto walk inherited DIR_FIGURE_NONE from the cross-country step before it (the laborer's
// unseen walk to the work camp road) and "arrived" on its first tick, so the laborer went cross-country over the
// water from the landing; and an idle laborer's unseen walk back from the site ran into the river and died there.
// Needs the Duo saves in the Pharaoh folder's Save/DuoSaves/; without them the test logs a skip and passes.
// Markers:
//   [test-marker] t935_laborers_cross_by_ferry
//   [test-marker] t935_save_skipped

function t935_run(name, ticks) {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/' + name + '.svx')) {
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
        __log_info_native('[test:935] no stepped pyramid complex in ' + name)
        return false
    }

    // Laborers already dying or on the water in the save are not counted.
    var preexisting = {}
    var died = {}
    var rode = {}
    var wet = 0
    var levelling = 0
    for (var tick = 0; tick < ticks; tick++) {
        __test_run_ticks(1)
        for (var f = 1; f < 3000; f++) {
            var fig = city.get_figure(f)
            if (!fig || !fig.valid || fig.type != FIGURE_LABORER) {
                continue
            }
            var x = __test_figure_tile_x(f)
            var y = __test_figure_tile_y(f)
            var on_water = __test_map_terrain_is(x, y, TERRAIN_WATER)
            if (tick == 0 && (on_water || __test_figure_is_dying(f))) {
                preexisting[f] = true
            }
            if (preexisting[f]) {
                continue
            }
            var a = __test_figure_get_action(f)
            if (a == ACTION_6_CARTPUSHER_ON_FERRY) {
                rode[f] = true
            }
            if (a == ACTION_22_LABORER_LEVEL_WORK && __building_main_id(__building_at(x, y)) == mon) {
                levelling++
            }
            if (__test_figure_is_dying(f)) {
                if (!died[f]) {
                    died[f] = true
                    __log_info_native('[test:935] ' + name + ' laborer ' + f + ' died at ' + x + ',' + y)
                }
            } else if (on_water && __test_figure_is_visible(f)) {
                wet++
            }
        }
    }
    var n_died = Object.keys(died).length
    var riders = Object.keys(rode).length
    __log_info_native('[test:935] ' + name + ': ' + n_died + ' laborers died, ' + wet + ' laborer-ticks walking on water, '
        + riders + ' rode the ferry, ' + levelling + ' laborer-ticks levelling the complex')
    return n_died == 0 && wet == 0 && riders > 0 && levelling > 0
}

function run_test() {
    var ok = t935_run('Meidum 3', 1600)
    ok = t935_run('Meidum 4', 2800) && ok
    if (ok && !__test_find_inlog('[test-marker] t935_save_skipped')) {
        __log_marker('t935_laborers_cross_by_ferry')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t935_laborers_cross_by_ferry') || __test_find_inlog('[test-marker] t935_save_skipped')
}
