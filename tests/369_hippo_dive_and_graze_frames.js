// A hippo's dive in the water (ACTION_26 ANIMATE, SprAmbient group 29) is one 36-frame strip with no facings.
// Drawn as facing + 8 * frame it ran into group 30 (another figure's art) and flickered between the two.
// Swimming, resting in the water and grazing on land (groups 25-28) have 12 frames per facing, and showed 8.
// Needs the game's images; without them the art checks are skipped.

var __test369_ok = false

function test369_fail(msg) {
    __log_info_native('[test:369] ' + msg)
    __test369_ok = false
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:369] hippo dive and graze frames')
    test_reload_city_session('data/default.map')
    city.figures.remove_figures(FIGURE_HIPPO)

    var dive_first = __test_image_id_from_group(PACK_SPR_AMBIENT, 29, 0)
    var dive_end = __test_image_id_from_group(PACK_SPR_AMBIENT, 30, 0)
    var graze_first = __test_image_id_from_group(PACK_SPR_AMBIENT, 28, 0)
    if (!(dive_first > 0) || !(dive_end > dive_first) || !(graze_first > 0)) {
        __log_marker('hippo_frames_skipped_no_images')
        __test369_ok = true
        __test_signal_ready()
        return
    }

    // Dive: every facing stays inside group 29.
    for (var x = 30; x <= 34; ++x) {
        for (var y = 30; y <= 34; ++y) {
            __test_make_deep_water(x, y)
        }
    }
    var wid = test_figure_create(FIGURE_HIPPO, 32, 32)
    if (!wid) {
        return test369_fail('water hippo not created')
    }
    var seen = {}
    for (var dir = 0; dir < 8; ++dir) {
        __test_figure_set_direction(wid, dir)
        __test_figure_set_action(wid, 26)
        __test_figure_set_wait_ticks(wid, 20)
        for (var t = 0; t < 60 && __figure_get_action_state(wid) == 26; ++t) {
            __test_figure_action_perform(wid)
            if (__figure_get_action_state(wid) != 26) {
                break
            }
            var img = __test_figure_main_image_id(wid)
            if (img < dive_first || img >= dive_end) {
                return test369_fail('dive facing ' + dir + ' tick ' + t + ' drew image ' + img + ', outside group 29 [' + dive_first + ',' + dive_end + ')')
            }
            seen[img - dive_first] = true
        }
    }
    var dive_frames = 0
    for (var k in seen) {
        dive_frames++
    }
    __log_info_native('[test:369] dive used ' + dive_frames + ' frames of group 29')
    if (dive_frames < 8) {
        return test369_fail('dive used only ' + dive_frames + ' frames')
    }

    // Grazing on land: all 12 frames of the facing.
    var lid = test_figure_create(FIGURE_HIPPO, 12, 14)
    if (!lid) {
        return test369_fail('land hippo not created')
    }
    __test_figure_set_action(lid, 18)
    __test_figure_set_wait_ticks(lid, 400)
    var most = 0
    for (var t = 0; t < 30; ++t) {
        __test_figure_action_perform(lid)
        var off = __test_figure_main_image_id(lid) - graze_first
        if (off < 0 || off >= 96) {
            return test369_fail('grazing drew offset ' + off + ' outside group 28')
        }
        most = Math.max(most, off >> 3)
    }
    __log_info_native('[test:369] grazing reached frame ' + most)
    if (most != 11) {
        return test369_fail('grazing reached frame ' + most + ', want 11')
    }

    __log_marker('hippo_frames_ok')
    __test369_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __test369_ok && (__test_find_inlog('[test-marker] hippo_frames_ok') || __test_find_inlog('[test-marker] hippo_frames_skipped_no_images'))
}
