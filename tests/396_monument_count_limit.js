// A mission's monuments are its briefing's three slots, one building each (OG monument_register), but any number
// could be placed (Brendan on the Duo). A monument can now be placed as many times as the slots name it: the planner
// refuses the next one ("#monument_limit_reached") and the build menu greys it out. A type no slot names (test maps,
// the editor) has no limit.
// Markers:
//   [test-marker] monument_limit_one_slot
//   [test-marker] monument_limit_two_slots
//   [test-marker] monument_no_slot_no_limit

var __test396_ok = false

function t396_fail(msg) {
    __log_info_native('[test:396] FAIL ' + msg)
    __test_signal_ready()
}

function t396_can_place_another() {
    test_planner_enter_build_mode(BUILDING_SMALL_MASTABA)
    var w = (__scenario_map.width / 2) | 0
    var h = (__scenario_map.height / 2) | 0
    var best = -1
    for (var dy = -12; dy <= 12 && best != CAN_PLACE; dy += 6) {
        for (var dx = -12; dx <= 12; dx += 6) {
            city_planner.update(w + dx, h + dy)
            best = city_planner.can_be_placed()
            if (best == CAN_PLACE) {
                break
            }
        }
    }
    test_planner_exit_build_mode()
    return best == CAN_PLACE
}

function t396_session(slots) {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_SMALL_MASTABA, true)
    __scenario_monuments.first = slots[0]
    __scenario_monuments.second = slots[1]
    __scenario_monuments.third = slots[2]
}

function run_test() {
    __log_info_native('[test:396] monument count limit')

    // One slot (Men-nefer: small mastaba, def 18): one, then no more.
    t396_session([18, 0, 0])
    if (!t396_can_place_another()) {
        return t396_fail('one slot: the first mastaba refused')
    }
    if (!test_building_place(BUILDING_SMALL_MASTABA, -1, -1)) {
        return t396_fail('one slot: place failed')
    }
    var second = t396_can_place_another()
    var greyed = building_is_unique_built(BUILDING_SMALL_MASTABA)
    __log_info_native('[test:396] one slot, one built: another placeable ' + second + ', menu greyed ' + greyed)
    if (second || !greyed) {
        return t396_fail('one slot: a second mastaba allowed')
    }
    __log_marker('monument_limit_one_slot')

    // Two slots name it: the second is allowed, the third isn't.
    t396_session([18, 18, 0])
    test_building_place(BUILDING_SMALL_MASTABA, -1, -1)
    var after_one = t396_can_place_another()
    test_building_place(BUILDING_SMALL_MASTABA, -1, -1)
    var after_two = t396_can_place_another()
    __log_info_native('[test:396] two slots: after one ' + after_one + ', after two ' + after_two)
    if (!after_one || after_two) {
        return t396_fail('two slots: after one ' + after_one + ', after two ' + after_two)
    }
    __log_marker('monument_limit_two_slots')

    // No slot names it: no limit.
    t396_session([0, 0, 0])
    test_building_place(BUILDING_SMALL_MASTABA, -1, -1)
    var free = t396_can_place_another() && !building_is_unique_built(BUILDING_SMALL_MASTABA)
    if (!free) {
        return t396_fail('no slot: limited')
    }
    __log_marker('monument_no_slot_no_limit')

    __test396_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test396_ok && __test_find_inlog('[test-marker] monument_limit_one_slot')
        && __test_find_inlog('[test-marker] monument_limit_two_slots')
        && __test_find_inlog('[test-marker] monument_no_slot_no_limit')
}
