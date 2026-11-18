// A temple complex turns while it is placed (R on a keyboard), but touch screens had no Rotate button for it: the
// button shows for buildings flagged allow_rotate (statues, mastabas) and the complexes weren't (Brendan on the Duo,
// Selima). The complex's orientation also took the planner's current orientation + 1: it started at 2 and the first
// R landed back on 2. With manual rotation off, each god's complex now shows the button, and every tap turns the
// ghost to a new facing (four taps, four facings).
// Markers:
//   [test-marker] temple_complex_rotate_button_turns

var T386_COMPLEXES = [BUILDING_TEMPLE_COMPLEX_OSIRIS, BUILDING_TEMPLE_COMPLEX_RA, BUILDING_TEMPLE_COMPLEX_PTAH,
    BUILDING_TEMPLE_COMPLEX_SETH, BUILDING_TEMPLE_COMPLEX_BAST]

function t391_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    var manual_prev = game_features.get('gameui_rotate_manually')
    game_features.set('gameui_rotate_manually', false)

    var report = []
    var ok = true
    for (var i = 0; i < T386_COMPLEXES.length; i++) {
        var type = T386_COMPLEXES[i]
        __scenario_building_allow(type, true)
        test_planner_enter_build_mode(type)
        __test_pump_frames(3)
        var facings = [city_planner.relative_orientation]
        for (var k = 0; k < 3; k++) {
            t391_tap(__test_construction_rotate_button_pos())
            facings.push(city_planner.relative_orientation)
        }
        var distinct = {}
        for (var k = 0; k < facings.length; k++) {
            distinct[facings[k]] = true
        }
        report.push(type + ': ' + facings.join(','))
        if (Object.keys(distinct).length != 4 || city_planner.build_type != type) {
            ok = false
        }
        test_planner_exit_build_mode()
        __test_pump_frames(2)
    }
    game_features.set('gameui_rotate_manually', manual_prev)
    __log_info_native('[test:391] ' + JSON.stringify(report))
    if (ok) {
        __log_marker('temple_complex_rotate_button_turns')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] temple_complex_rotate_button_turns')
}
