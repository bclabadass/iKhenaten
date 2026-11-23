// The original has one granary picture. A granary in a desirable area (above 30) switched to a "fancy" picture that
// was frame 1 of the granary group, a small 40x63 sprite: the 4x4 granary drew as a black square (Brendan, Saqqara 3).
// Needs the game's images; skipped without them.
// Markers:
//   [test-marker] t903_granary_keeps_picture
//   [test-marker] t903_skipped_no_images

function run_test() {
    test_reload_city_session('data/default.map')
    var base = __test_image_id_from_group(PACK_GENERAL, 99, 0)
    if (!(base > 0)) {
        __log_marker('t903_skipped_no_images')
        __test_signal_ready()
        return
    }
    __scenario_building_allow(BUILDING_GRANARY, true)
    __test_set_treasury(100000)
    var bid = test_building_place(BUILDING_GRANARY, 40, 40)
    if (!bid) {
        __log_info_native('[test:903] granary not placed')
        __test_signal_ready()
        return
    }
    var t = __building_tile(bid)
    __test_set_desirability(t.x, t.y, 60)
    __test_granary_update_graphic(bid)
    var img = __map_image_at(t)
    __log_info_native('[test:903] granary in a desirable area: map image ' + img + ', base picture ' + base)
    if (img == base) {
        __log_marker('t903_granary_keeps_picture')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t903_granary_keeps_picture')
        || __test_find_inlog('[test-marker] t903_skipped_no_images')
}
