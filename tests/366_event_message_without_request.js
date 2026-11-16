// An event message that requests nothing shows no request line (Brendan on the Duo: "Perfect Flood Expected" and
// many other alerts ended "800 Nothing Month 0 to comply"). Event messages on the general template open in the
// window built for Pharaoh's requests, which always added the requested good, amount and months; for a flood the
// event's amount filled in and the good was "Nothing". The line now shows only when a good is requested.
// Markers:
//   [test-marker] flood_message_has_no_request_line
//   [test-marker] request_message_keeps_request_line

function t366_post(item, amount) {
    ui.window_city_show()
    __test_pump_frames(2)
    __test_post_event_message(item, amount, PHRASE_perfect_flood_title, PHRASE_perfect_flood_initial_announcement,
        PHRASE_perfect_flood_no_reason_A)
    __test_process_events()
    __test_pump_frames(6)
    var section = __test_message_dialog_section()
    return { section: section, text: '' + __test_window_element_text(section, 'content_text') }
}

function run_test() {
    test_reload_city_session('data/default.map')
    var comply = __loc(12, 2)

    var flood = t366_post(0, 8)
    __log_info_native('[test:366] flood message (' + flood.section + '): ' + JSON.stringify(flood.text))
    if (flood.text.length > 0 && flood.text.indexOf(comply) < 0) {
        __log_marker('flood_message_has_no_request_line')
    }

    var request = t366_post(RESOURCE_GRAIN, 5)
    __log_info_native('[test:366] message with a good requested: ' + JSON.stringify(request.text))
    if (request.text.indexOf(comply) >= 0) {
        __log_marker('request_message_keeps_request_line')
    }
    ui.window_city_show()
    __test_pump_frames(2)
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] flood_message_has_no_request_line')
        && __test_find_inlog('[test-marker] request_message_keeps_request_line')
}
