// When an invading army arrives, the message was Caesar 3's "Barbarians attack!" (or "Legion attacks") for every
// enemy, with an empty text and a house-plot picture as its go-to button. It now posts Pharaoh's own attack message
// for the kind of army: "Foreign Army Invades" with the army's name ("a Kushite army is upon us..."), "Bedouin Army
// Attacks", "Egyptian Army Attacks", "Pharaoh's Army Attacks"; the go-to button uses the go-to picture, as in the
// disaster messages. The army-name check needs the Pharaoh texts and is otherwise skipped.
// The invasion and disaster windows keep their own layout: the message's size used to widen the text box past
// its panel (text ran out of the window) and stretch the panel under the go-to button, whose 38x45 picture
// reached up into the text; the picture is now drawn at 0.6, inside its 27x27 slot below the panel.
// Markers:
//   [test-marker] attack_messages_per_army
//   [test-marker] attack_message_goto_picture
//   [test-marker] attack_message_names_army
//   [test-marker] army_name_skipped
//   [test-marker] message_text_inside_panel

var T335_SECTION = 'message_dialog_window_invasion'

// Arrive with `args`; returns what was posted and shown.
function t335_arrive(args) {
    var before = __city_message_count()
    var seq = city.start_foreign_army_invasion(args)
    __test_process_events()
    __test_pump_frames(4)
    var r = { seq: seq, key: '', title: -1, body: -1, param1: -1, section: __test_message_dialog_section() }
    if (__city_message_count() > before) {
        var i = __city_message_count() - 1
        r.key = __lang_get_message_id(__city_message_mm_text_id(i))
        r.title = __city_message_eventmsg_title_id(i)
        r.body = __city_message_eventmsg_body_id(i)
        r.param1 = __city_message_param1(i)
    }
    r.text = __test_window_element_text(T335_SECTION, 'content_text')
    r.goto = __test_window_element_image(T335_SECTION, 'button_go_to_problem')
    r.fits = t335_layout_fits(T335_SECTION)
    if (ui.window_is('window_message_dialog')) {
        window_go_back()
    }
    __test_pump_frames(2)
    __log_info_native('[test:335] ' + JSON.stringify(args) + ' -> ' + r.key + ' title ' + r.title + ' body ' + r.body
        + ' seq ' + r.seq + '/' + r.param1 + ' window ' + r.section)
    return r
}

// The text box lies inside its panel and the go-to button below it.
function t335_layout_fits(section) {
    var panel = __test_window_element_screen_pos(section, 'content_panel')
    var blocks = __test_window_element_size(section, 'content_panel')
    var text = __test_window_element_screen_pos(section, 'content_text')
    var text_size = __test_window_element_size(section, 'content_text')
    var button = __test_window_element_screen_pos(section, 'button_go_to_problem')
    var right = panel.x + blocks.x * 16
    var bottom = panel.y + blocks.y * 16
    var fits = text.x >= panel.x && text.x + text_size.x <= right && text.y + text_size.y <= bottom && button.y >= bottom
    __log_info_native('[test:335] ' + section + ' panel ' + panel.x + '..' + right + ' x ' + panel.y + '..' + bottom
        + ', text ' + text.x + '..' + (text.x + text_size.x) + ' x ' + text.y + '..' + (text.y + text_size.y)
        + ', go-to button top ' + button.y)
    return fits
}

function run_test() {
    test_reload_city_session('data/default.map')
    __display_options_set_scale(100)
    __test_pump_frames(3)

    var cases = [
        { args: { enemy: ENEMY_6_KUSHITE, size: 4, tilex: -1, tiley: -1 },
          title: PHRASE_foreign_army_attacks_you_title, body: PHRASE_foreign_army_attacks_you_city_attacked_alert },
        { args: { enemy: ENEMY_0_BARBARIAN, size: 4, tilex: -1, tiley: -1 },
          title: PHRASE_bedouin_attacks_you_title, body: PHRASE_bedouin_attacks_you_city_attacked_alert },
        { args: { enemy: ENEMY_3_EGYPTIAN, size: 4, tilex: -1, tiley: -1 },
          title: PHRASE_eg_city_attacks_you_title, body: PHRASE_eg_city_attacks_you_city_attacked_alert },
        { args: { enemy: ENEMY_3_EGYPTIAN, size: 4, tilex: -1, tiley: -1, kind: INVASION_KIND_KINGDOME },
          title: PHRASE_pharaoh_attacks_you_title, body: PHRASE_pharaoh_attacks_you_city_attacked_alert },
    ]
    var results = []
    var all_right = true
    for (var i = 0; i < cases.length; i++) {
        var r = t335_arrive(cases[i].args)
        results.push(r)
        if (r.key != 'message_template_invasion' || r.title != cases[i].title || r.body != cases[i].body
            || r.param1 != r.seq || r.section != T335_SECTION) {
            all_right = false
        }
    }
    if (all_right) {
        __log_marker('attack_messages_per_army')
    }

    __city_message_post_with_popup_delay(MESSAGE_CAT_FIRE, true, 'message_fire_in_the_city', 0, 0, false, '')
    __test_process_events()
    __test_pump_frames(4)
    var disaster_fits = __test_message_dialog_section() == 'message_dialog_window_disaster'
        && t335_layout_fits('message_dialog_window_disaster')
    if (ui.window_is('window_message_dialog')) {
        window_go_back()
    }
    __test_pump_frames(2)
    if (results[0].fits && disaster_fits) {
        __log_marker('message_text_inside_panel')
    }

    __log_info_native('[test:335] go-to picture ' + results[0].goto)
    if (results[0].goto == PACK_GENERAL + ',136,52') {
        __log_marker('attack_message_goto_picture')
    }

    var kushite_army = __loc(37, 32)
    if (kushite_army.indexOf('#') == 0) {
        __log_marker('army_name_skipped')
    } else {
        __log_info_native('[test:335] Kushite text: ' + results[0].text)
        if (results[0].text.indexOf(kushite_army) >= 0) {
            __log_marker('attack_message_names_army')
        }
    }

    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] attack_messages_per_army')
        && __test_find_inlog('[test-marker] attack_message_goto_picture')
        && __test_find_inlog('[test-marker] message_text_inside_panel')
        && (__test_find_inlog('[test-marker] attack_message_names_army') || __test_find_inlog('[test-marker] army_name_skipped'))
}
