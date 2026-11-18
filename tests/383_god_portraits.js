// God message portraits (Selima, Duo: Ra's blessing showed Bast). The god window's portrait table was shifted:
// offset 18 is a city sketch, and Ra/Ptah/Bast pointed at Bast/Ra/Ptah. Each god's messages name the picture
// as "@N" (Bast 20, Seth 21, Ptah 22, Ra 23, Osiris 24); in Unloaded group 16 it is offset N - 1.
// Ra's kingdom-reputation blessing also posted "message_blessing_ra_kingdom", which does not exist, so its
// popup was dropped ("unknown message id").
// Markers:
//   [test-marker] god_portrait_offsets_ok
//   [test-marker] ra_reputation_blessing_posts_ok

var __test383_ok = false

function test383_fail(msg) {
    __log_info_native('[test:383] FAIL ' + msg)
    __test_signal_ready()
}

function run_test() {
    __log_info_native('[test:383] god portraits')
    test_reload_city_session('data/default.map')

    var gods = {
        osiris: 'message_blessing_from_osiris',
        ra: 'message_blessing_trade_from_ra',
        ptah: 'message_blessing_trade_from_ptah',
        seth: 'message_blessing_trade_from_seth',
        bast: 'message_blessing_from_bast'
    }
    var images = message_dialog_window_god.god_images
    for (var name in gods) {
        var video = game_messages_en[gods[name]].video.text
        var want = parseInt(video.substring(1), 10) - 1
        if (images[name].offset != want) {
            return test383_fail(name + ' portrait offset ' + images[name].offset + ', its messages name ' + video + ' (offset ' + want + ')')
        }
    }
    __log_marker('god_portrait_offsets_ok')

    city.gods.set_known(GOD_RA, true)
    for (var i = 0; i < 24; i++) {
        __test_god_set_state(GOD_RA, 95, 2)
        for (var d = 0; d < 120; d++) {
            __test_religion_update_mood(GOD_RA)
        }
        __test_religion_monthly_blessings(GOD_RA)
        __test_pump_frames(2)
        window_go_back()
    }
    if (__test_find_inlog("unknown message id 'message_blessing_ra")) {
        return test383_fail('Ra blessing posted an unknown message id')
    }
    if (!__lang_get_message_id('message_blessing_reputation_from_ra')) {
        return test383_fail('message_blessing_reputation_from_ra missing')
    }
    __log_marker('ra_reputation_blessing_posts_ok')

    __test383_ok = true
    __test_signal_ready()
}

function check_valid() {
    if (!__test383_ok) {
        return false
    }
    var markers = ['god_portrait_offsets_ok', 'ra_reputation_blessing_posts_ok']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            __log_info_native('[test:383] missing marker: ' + markers[i])
            return false
        }
    }
    return true
}
