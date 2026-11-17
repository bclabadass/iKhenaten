// A laborer pulling a sled train used SprMain group 160 for its "pulling" sprite: the original's group number,
// but SprMain here is numbered 39 lower (figures.js, figure_sled), so 160 is the ostrich's idle animation and the
// train's leader flickered into an ostrich whenever it pulled (Brendan, build 13854). Group 121 is the
// laborer pulling art (the sled pullers' "pulling" uses it too). Needs the game's images; skipped without them.

var __test379_ok = false

function test379_fail(msg) {
    __log_info_native('[test:379] ' + msg)
    __test379_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:379] sled train leader is not an ostrich')
    test_reload_city_session('data/default.map')
    var pull_first = __test_image_id_from_group(PACK_SPR_MAIN, 121, 0)
    var pull_end = __test_image_id_from_group(PACK_SPR_MAIN, 122, 0)
    var ostrich_first = __test_image_id_from_group(PACK_SPR_MAIN, 156, 0)
    var ostrich_end = __test_image_id_from_group(PACK_SPR_MAIN, 161, 0)
    if (!(pull_first > 0) || !(pull_end > pull_first)) {
        __log_marker('sled_leader_skipped_no_images')
        __test379_ok = true
        __test_signal_ready()
        return
    }

    var fid = test_figure_create(FIGURE_LABORER, 40, 40)
    if (!fid) {
        return test379_fail('laborer not created')
    }
    var actions = [37, 19, 23, 36]
    for (var i = 0; i < actions.length; ++i) {
        __test_figure_set_action(fid, actions[i])
        for (var dir = 0; dir < 8; ++dir) {
            __test_figure_set_direction(fid, dir)
            __test_figure_refresh_animation_and_image(fid)
            var img = __test_figure_main_image_id(fid)
            if (img >= ostrich_first && img < ostrich_end) {
                return test379_fail('action ' + actions[i] + ' facing ' + dir + ' draws ostrich image ' + img)
            }
            if (img < pull_first || img >= pull_end) {
                return test379_fail('action ' + actions[i] + ' facing ' + dir + ' draws image ' + img + ', not the pulling art [' + pull_first + ',' + pull_end + ')')
            }
        }
    }
    __log_marker('sled_leader_ok')
    __test379_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test379_ok
}
