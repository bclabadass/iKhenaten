// When an invading army arrives, the message was Caesar 3's "Barbarians attack!" (or "Legion attacks") for every
// enemy, with an empty text and a house-plot picture as its go-to button. It now posts Pharaoh's own attack message
// for the kind of army: "Foreign Army Invades" with the army's name ("a Kushite army is upon us..."), "Bedouin Army
// Attacks", "Egyptian Army Attacks", "Pharaoh's Army Attacks"; the go-to button uses the go-to picture, as in the
// disaster messages. The army-name check needs the Pharaoh texts and is otherwise skipped.
// Markers:
//   [test-marker] attack_messages_per_army
//   [test-marker] attack_message_goto_picture
//   [test-marker] attack_message_names_army
//   [test-marker] army_name_skipped

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
    if (ui.window_is('window_message_dialog')) {
        window_go_back()
    }
    __test_pump_frames(2)
    __log_info_native('[test:335] ' + JSON.stringify(args) + ' -> ' + r.key + ' title ' + r.title + ' body ' + r.body
        + ' seq ' + r.seq + '/' + r.param1 + ' window ' + r.section)
    return r
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
        && (__test_find_inlog('[test-marker] attack_message_names_army') || __test_find_inlog('[test-marker] army_name_skipped'))
}
