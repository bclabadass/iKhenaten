// A conservatory keeps sending musicians to its venues while one of them walks to the festival square. The square
// musician took the conservatory's service slot, which is the one its venue musicians need free, and the walk there
// and back lasts months, so most conservatories sent no musician to a bandstand or pavilion; venues went without
// music and houses near them lost entertainment and devolved (Brendan, Saqqara 10: "musicians not making it to
// bandstands", "spacious apartments devolving to modest apartments for not enough variety"). The save has square
// musicians already out in the service slot, so a school sends to a venue only once they are home (about 2700 frames).
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t911_every_conservatory_sends_to_venues
//   [test-marker] t911_save_skipped

function run_test() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara 10.svx')) {
        __log_marker('t911_save_skipped')
        __test_signal_ready()
        return
    }
    var schools = {}
    var count = 0
    for (var i = 1; i < 4000; i++) {
        var b = city.get_building(i)
        if (b && b.state && b.type == BUILDING_CONSERVATORY && b.num_workers > 0) {
            schools[i] = {}
            count++
        }
    }
    for (var k = 0; k < 80; k++) {
        __test_pump_frames(50)
        if (ui.window_is('window_message_dialog')) {
            window_go_back()
        }
        for (var f = 1; f < 5000; f++) {
            var fg = city.get_figure(f)
            if (fg && fg.valid && fg.type == FIGURE_MUSICIAN && fg.action_state == ACTION_2_ENTERTAINER_GOING_TO_VENUE
                && schools[fg.home_building_id]) {
                schools[fg.home_building_id][f] = 1
            }
        }
    }
    var sending = 0
    var report = ''
    for (var id in schools) {
        var sent = Object.keys(schools[id]).length
        report += ' ' + id + ':' + sent
        if (sent > 0) {
            sending++
        }
    }
    __log_info_native('[test:911] conservatories ' + count + ', sending to venues ' + sending + ' (musicians per school' + report + ')')
    if (count > 0 && sending == count) {
        __log_marker('t911_every_conservatory_sends_to_venues')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t911_every_conservatory_sends_to_venues')
        || __test_find_inlog('[test-marker] t911_save_skipped')
}
