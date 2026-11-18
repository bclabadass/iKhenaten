// Tapping a temple complex's altar or oracle (separate parts of it, there even before they're bought) opened the
// generic building window, which couldn't name them: "??building.name?" with only a staffing line (Brendan on the
// Duo, Selima). Every part now opens the complex's own window, which names its altar and oracle, says whether each
// is built, and gives the god's description (group 59) that explains them.
// Markers:
//   [test-marker] temple_complex_parts_open_complex_window

var T392_COMPLEXES = [BUILDING_TEMPLE_COMPLEX_OSIRIS, BUILDING_TEMPLE_COMPLEX_RA, BUILDING_TEMPLE_COMPLEX_PTAH,
    BUILDING_TEMPLE_COMPLEX_SETH, BUILDING_TEMPLE_COMPLEX_BAST]

function t392_fail(msg) {
    __log_info_native('[test:392] FAIL ' + msg)
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:392] temple complex info window')
    for (var g = 0; g < T392_COMPLEXES.length; g++) {
        var type = T392_COMPLEXES[g]
        test_reload_city_session('data/default.map')
        __test_set_treasury(100000)
        __scenario_building_allow(type, true)
        var main = test_building_place(type, -1, -1)
        if (!main) {
            return t392_fail('place ' + type)
        }
        var parts = []
        for (var b = 1; b < 300; b++) {
            var bb = city.get_building(b)
            if (bb && bb.state == 1) {
                parts.push(b)
            }
        }
        var name = __loc(28, type)
        var altar = __loc(189, g * 2)
        var oracle = __loc(189, g * 2 + 1)
        for (var i = 0; i < parts.length; i++) {
            __test_show_tile_info(parts[i])
            __test_pump_frames(4)
            var got = [__test_info_window_section(), __test_info_ui_text('title'), __test_info_ui_text('altar_text'),
                __test_info_ui_text('oracle_text'), __test_info_ui_text('description')]
            ui.window_city_show()
            __test_pump_frames(2)
            if (got[0] != 'info_window_temple_complex' || got[1] != name || ('' + got[2]).indexOf(altar) != 0
                || ('' + got[3]).indexOf(oracle) != 0 || ('' + got[4]).indexOf(('' + __loc(59, 32 + g)).substring(0, 40)) != 0) {
                return t392_fail('complex ' + type + ' part ' + parts[i] + ' (type ' + city.get_building(parts[i]).type
                    + '): ' + JSON.stringify(got).substring(0, 200))
            }
        }
        __log_info_native('[test:392] complex ' + type + ': ' + parts.length + ' parts open "' + name + '"')
    }
    __log_marker('temple_complex_parts_open_complex_window')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] temple_complex_parts_open_complex_window')
}
