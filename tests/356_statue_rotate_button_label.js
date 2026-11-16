// While placing a building that turns (a statue), touch screens get a Rotate button below the placement buttons.
// It read "R", the keyboard key; the button that turns a company reads "Rotate" (Brendan on the Duo: make the
// statue's read Rotate too). It now shares that label and widens to fit it, and a tap still turns the statue.
// Markers:
//   [test-marker] statue_rotate_button_reads_rotate
//   [test-marker] statue_rotate_button_turns_statue

function t356_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

// A statue's R steps its facing and picture set (statue_og_advance) rather than the planner's orientation alone.
function t356_turn() {
    return city_planner.global_rotation + '/' + city_planner.relative_orientation + '/' + city_planner.custom_building_variant
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    if (!__scenario_building_allowed(BUILDING_SMALL_STATUE)) {
        __scenario_building_allow(BUILDING_SMALL_STATUE, true)
    }
    test_planner_enter_build_mode(BUILDING_SMALL_STATUE)
    __test_pump_frames(3)

    var text = __test_construction_rotate_button_text()
    var width = __test_construction_rotate_button_width()
    __log_info_native('[test:356] statue rotate button reads ' + JSON.stringify(text) + ', width ' + width)
    if (text == 'Rotate' && width >= 64) {
        __log_marker('statue_rotate_button_reads_rotate')
    }

    var before = t356_turn()
    t356_tap(__test_construction_rotate_button_pos())
    var after = t356_turn()
    __log_info_native('[test:356] rotation/orientation/variant ' + before + ' -> ' + after + ', build type ' + city_planner.build_type)
    if (after != before) {
        __log_marker('statue_rotate_button_turns_statue')
    }

    test_planner_exit_build_mode()
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] statue_rotate_button_reads_rotate')
        && __test_find_inlog('[test-marker] statue_rotate_button_turns_statue')
}
