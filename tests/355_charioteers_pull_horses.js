// The city's chariots are pulled by horses. A chariot is drawn as the chariot and its riders (SprMain 67 walk, 69
// fight) plus its horses, a separate picture drawn like a cart (SprMain 113, 12 frames by 8 facings), as enemy
// chariots are (test 347). Our charioteers drew no horses: only the chariot with its empty yoke poles.
// Markers:
//   [test-marker] charioteers_pull_horses

function run_test() {
    test_reload_city_session('data/default.map')
    var horses = __test_image_from_desc(PACK_SPR_MAIN, 113, 0)
    var fid = test_figure_create(FIGURE_FCHARIOTEER, 40, 40)
    var seen = []
    var wrong = 0
    for (var dir = 0; dir < 8; dir += 2) {
        __test_figure_set_direction(fid, dir)
        __test_figure_refresh_image(fid)
        var cart = __test_figure_cart_image_id(fid)
        seen.push(cart > 0 ? cart - horses : 'none')
        if (cart < horses || cart >= horses + 96) {
            wrong++
        }
    }
    __log_info_native('[test:355] charioteer horse pictures (from group 113) by facing: ' + seen.join(','))
    if (fid && wrong == 0) {
        __log_marker('charioteers_pull_horses')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] charioteers_pull_horses')
}
