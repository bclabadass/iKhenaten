// Pyramid follow-ups (Brendan, build 14142): a sled train walked through the base of the pyramid to the ramp instead
// of around it, and a stonemason waiting for his block stood frozen mid-stride. The pyramid's footprint is open ground
// in the citizens' routing grid, so the laborer's route from the yard to the entry cut straight across the laid
// courses (on Saqqara 10 from the north side to the access point on the south side), and the sleds follow his tiles.
// A waiting mason held walk frame 0; he now shows the walk frame with his feet together (the original has no standing
// group for him).
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t918_trains_go_around
//   [test-marker] t918_waiting_masons_idle
//   [test-marker] t918_save_skipped

function t918_on_pyramid(mon, fid) {
    var x = __test_figure_tile_x(fid)
    var y = __test_figure_tile_y(fid)
    return __building_main_id(__building_at(x, y)) == mon
}

// The laborer pulling this sled (the front of its chain), or 0.
function t918_train_laborer(fid) {
    var id = fid
    for (var hop = 0; hop < 12 && id > 0; hop++) {
        var f = city.get_figure(id)
        if (!f || !f.valid) {
            return 0
        }
        if (f.type == FIGURE_LABORER) {
            return id
        }
        id = __test_figure_get_leading(id)
    }
    return 0
}

// On the way from the yard to the ramp, on a trip that began in this run (the save holds routes made before the fix).
var t918_loaded_here = {}
function t918_approaching(fid) {
    var a = __test_figure_get_action(fid)
    return t918_loaded_here[fid] && (a == ACTION_17_LABORER_TO_PYRAMID || a == ACTION_30_LABORER_SLED_AT_RAMP)
}

function run_test() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara 10.svx')) {
        __log_marker('t918_save_skipped')
        __test_signal_ready()
        return
    }
    __test_pump_frames(2)
    var mon = 0
    for (var i = 1; i < 4000 && !mon; i++) {
        var b = city.get_building(i)
        if (b && b.state && b.type == BUILDING_MEDIUM_STEPPED_PYRAMID && __building_main_id(i) == i) {
            mon = i
        }
    }
    var idle_base = __test_image_id_from_group(PACK_SPR_MAIN, 150, 72)
    var approach = 0, crossing = 0, reached = {}, reached_n = 0, crossed_by = ''
    var waiting = 0, not_idle = 0, seen_image = -1
    var was_approaching = {}
    for (var k = 0; k < 9000 && (reached_n < 2 || waiting < 100); k++) {
        __test_pump_frames(1)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
        for (var j = 1; j < 3000; j++) {
            var f = city.get_figure(j)
            if (!f || !f.valid) {
                continue
            }
            if (f.type == FIGURE_LABORER) {
                if (f.action_state == ACTION_16_LABORER_AT_STORAGE_YARD) {
                    t918_loaded_here[j] = true
                }
                var on_way = t918_approaching(j)
                if (on_way) {
                    approach++
                    was_approaching[j] = true
                    if (t918_on_pyramid(mon, j)) {
                        crossing++
                        crossed_by = 'laborer ' + j + ' at ' + __test_figure_tile_x(j) + ',' + __test_figure_tile_y(j)
                    }
                } else if (was_approaching[j] && __test_figure_get_action(j) == ACTION_18_LABORER_CLIMB_RAMP && !reached[j]) {
                    reached[j] = true
                    reached_n++
                }
            } else if (f.type == FIGURE_SLED || f.type == FIGURE_SLED_PULLER) {
                var lab = t918_train_laborer(j)
                if (lab && t918_approaching(lab) && t918_on_pyramid(mon, j)) {
                    crossing++
                    crossed_by = 'sled ' + j + ' at ' + __test_figure_tile_x(j) + ',' + __test_figure_tile_y(j)
                }
            } else if (f.type == FIGURE_STONEMASON && f.action_state == ACTION_19_MASON_WAIT_FOR_BLOCK) {
                var img = __test_figure_main_image_id(j)
                waiting++
                seen_image = img
                if (img < idle_base || img >= idle_base + 8) {
                    not_idle++
                }
            }
        }
    }
    __log_info_native('[test:918] approach samples ' + approach + ', on the pyramid ' + crossing + (crossed_by ? ' (' + crossed_by + ')' : '')
        + ', trains at the ramp ' + reached_n + '; waiting mason samples ' + waiting + ', not idle ' + not_idle
        + ' (image ' + seen_image + ', idle from ' + idle_base + ')')
    if (approach > 0 && crossing == 0 && reached_n > 0) {
        __log_marker('t918_trains_go_around')
    }
    if (waiting > 0 && not_idle == 0) {
        __log_marker('t918_waiting_masons_idle')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return (__test_find_inlog('[test-marker] t918_trains_go_around')
        && __test_find_inlog('[test-marker] t918_waiting_masons_idle'))
        || __test_find_inlog('[test-marker] t918_save_skipped')
}
