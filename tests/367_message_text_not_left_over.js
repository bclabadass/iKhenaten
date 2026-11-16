// A message shows its own title and text, not the last message's (Brendan on the Duo: the employees-needed text
// under the title "Wrath of the Emperor"). The message dialog windows are shared, and one with no body text kept
// the previous message's text; Pharaoh's anger message ("Wrath of the Emperor", Caesar 3's, with no text) was such
// a message. The text box is cleared for each message, and that message is "Pharaoh is angry!" with a text of its
// own (the other languages already named Pharaoh).
// Markers:
//   [test-marker] next_message_has_its_own_text
//   [test-marker] pharaoh_anger_message_text
//   [test-marker] empty_message_shows_no_old_text

function t367_show(key) {
    ui.window_city_show()
    __test_pump_frames(2)
    __city_message_post_with_popup_delay(0, true, key, 0, 0, false, '')
    __test_process_events()
    __test_pump_frames(6)
    var section = __test_message_dialog_section()
    return { section: section, title: '' + __test_window_element_text(section, 'title'),
             text: '' + __test_window_element_text(section, 'content_text') }
}

function run_test() {
    test_reload_city_session('data/default.map')
    var employees = t367_show('message_employees_needed')
    var anger = t367_show('message_wrath_of_the_emperor')
    __log_info_native('[test:367] employees: ' + JSON.stringify(employees.title) + ' / ' + JSON.stringify(employees.text.slice(0, 40)))
    __log_info_native('[test:367] anger: ' + JSON.stringify(anger.title) + ' / ' + JSON.stringify(anger.text.slice(0, 60)))
    if (employees.text.length > 0 && anger.text.indexOf(employees.text) < 0) {
        __log_marker('next_message_has_its_own_text')
    }
    if (anger.title.indexOf('Emperor') < 0 && anger.text.indexOf('Pharaoh') >= 0) {
        __log_marker('pharaoh_anger_message_text')
    }

    t367_show('message_employees_needed')
    var empty = t367_show('message_template_general')
    __log_info_native('[test:367] message with no text after the employees one: ' + JSON.stringify(empty.text.slice(0, 60)))
    if (empty.text.indexOf('working age') < 0) {
        __log_marker('empty_message_shows_no_old_text')
    }
    ui.window_city_show()
    __test_pump_frames(2)
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] next_message_has_its_own_text')
        && __test_find_inlog('[test-marker] pharaoh_anger_message_text')
        && __test_find_inlog('[test-marker] empty_message_shows_no_old_text')
}
