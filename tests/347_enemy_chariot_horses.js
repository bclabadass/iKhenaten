// Enemy chariots are drawn with their horses (SprMain group 113, 12 frames by 8 directions) as the cart they pull.
// The horses were set in update_animation, but the figure's picture refresh then ran the generic cart update, which
// gave every chariot a cart pusher's empty wooden cart (group 77) instead: the chariot rolled behind a hand cart
// (Brendan on the Duo: "chariot horses look like a cart pusher's cart").
// Markers:
//   [test-marker] enemy_chariots_pull_horses

var T347_TYPES = [FIGURE_ENEMY_ASSYRIAN_CHARIOT, FIGURE_ENEMY_HYKSOS_CHARIOT, FIGURE_ENEMY_EGYPTIAN_CHARIOT,
    FIGURE_ENEMY_KUSHITE_CHARIOT, FIGURE_ENEMY_KINGDOME_MOUNTED]

function run_test() {
    test_reload_city_session('data/default.map')
    var horses = __test_image_from_desc(PACK_SPR_MAIN, 113, 0)
    var wrong = []
    for (var i = 0; i < T347_TYPES.length; i++) {
        var fid = test_figure_create(T347_TYPES[i], 30 + i * 3, 30)
        if (!fid) {
            wrong.push(T347_TYPES[i] + ':none')
            continue
        }
        var seen = []
        for (var dir = 0; dir < 8; dir += 2) {
            __test_figure_set_direction(fid, dir)
            __test_figure_refresh_animation_and_image(fid)
            var cart = __test_figure_cart_image_id(fid)
            seen.push(cart - horses)
            if (cart < horses || cart >= horses + 96) {
                wrong.push(T347_TYPES[i] + '/dir ' + dir)
            }
        }
        __log_info_native('[test:347] chariot type ' + T347_TYPES[i] + ' cart pictures (from horses group 113): '
            + seen.join(','))
    }
    __log_info_native('[test:347] not pulling horses: ' + JSON.stringify(wrong))
    if (wrong.length == 0) {
        __log_marker('enemy_chariots_pull_horses')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] enemy_chariots_pull_horses')
}
