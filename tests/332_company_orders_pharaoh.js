// The company orders panel is Pharaoh's, not Caesar 3's. Each company type has four orders with its own
// pictures (Pharaoh_Unloaded group 34): infantry and archers hold in tight or loose formation, engage
// nearby enemies or mop up; charioteers charge in place of loose formation. Return to Fort uses the
// type's picture, greyed while the company is home. The texts are Pharaoh's (group 138), and the header
// matches the fort's own window. R, or the Rotate button on a touch screen, turns a selected company a
// quarter clockwise; a line takes the other orientation (Pharaoh's keyboard help).
// Markers:
//   [test-marker] archer_order_pictures
//   [test-marker] charioteer_order_pictures
//   [test-marker] infantry_order_pictures
//   [test-marker] header_like_fort_window
//   [test-marker] tight_order_texts
//   [test-marker] engage_nearby_order
//   [test-marker] charioteer_charge_order
//   [test-marker] no_soldiers_text
//   [test-marker] rotate_key_turns_company
//   [test-marker] rotate_button_turns_company

var T332_SINGLE_LINE_1 = 3
var T332_SINGLE_LINE_2 = 4
var T332_COLUMN = 0
var T332_ENGAGE = 15

function t332_place(type) {
    if (!__scenario_building_allowed(type)) {
        __scenario_building_allow(type, true)
    }
    var bid = test_building_place(type, -1, -1)
    test_planner_exit_build_mode()
    return bid
}

function t332_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

function t332_open(fort) {
    __test_show_company_orders(fort)
    __test_pump_frames(4)
    return __test_info_window_section() == 'batalion_info_window'
}

function t332_close() {
    ui.window_city_show()
    __test_pump_frames(3)
}

function t332_tap_order(slot) {
    var id = 'formation_' + slot
    var pos = __test_info_ui_screen_pos(id)
    var size = __test_window_element_size('batalion_info_window', id)
    t332_tap({ x: pos.x + ((size.x / 2) | 0), y: pos.y + ((size.y / 2) | 0) })
}

// The four order buttons, then Return to Fort, as picture offsets; no fifth order button.
function t332_pictures(label, base, at_fort) {
    var got = []
    for (var i = 1; i <= 4; i++) {
        got.push(__test_info_ui_image_offset('formation_' + i))
    }
    got.push(__test_info_ui_image_offset('return_to_fort'))
    var want = [base, base + 1, base + 2, base + 3, base + (at_fort ? 5 : 4)]
    var extra = __test_info_ui_image_offset('formation_5')
    __log_info_native('[test:332] ' + label + ' pictures ' + JSON.stringify(got) + ' want ' + JSON.stringify(want)
        + ', fifth ' + extra)
    return JSON.stringify(got) == JSON.stringify(want) && extra == -1
}

// The key bound to rotate (R unless the player changed it).
function t332_rotate_key() {
    for (var i = 0; i < hotkey_bindings.defs.length; i++) {
        if (hotkey_bindings.defs[i].action === HOTKEY_ROTATE_BUILDING) {
            return hotkey_bindings.defs[i]
        }
    }
    return { key: KEY_NONE, modifiers: KEY_MOD_NONE }
}

function t332_company(fort) {
    return city.get_formation(city.get_building(fort).formation_id)
}

// Forts of each type, with soldiers for the archers and charioteers.
function t332_setup() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    __scenario_building_allow(BUILDING_FORT_GROUND, true)
    var recruiter = t332_place(BUILDING_RECRUITER)
    var archers = t332_place(BUILDING_FORT_ARCHERS)
    __test_fort_update_recruit_status(archers)
    for (var i = 0; i < 3; i++) {
        __test_recruiter_create_soldier(recruiter)
    }
    // Charioteers need chariots at the recruiter, and the archers (nearer, still short of 16) are held back so
    // these recruits go to the charioteers.
    var chariots = t332_place(BUILDING_FORT_CHARIOTEERS)
    __test_fort_update_recruit_status(chariots)
    var archer_company = city.get_building(archers).formation_id
    __test_formation_set_in_distant_battle(archer_company, 1)
    city.get_building(recruiter).consume_resource(RESOURCE_CHARIOTS, -300)
    for (var i = 0; i < 3; i++) {
        __test_recruiter_create_soldier(recruiter)
    }
    __test_formation_set_in_distant_battle(archer_company, 0)
    var infantry = t332_place(BUILDING_FORT_INFANTRY)
    __test_pump_frames(3)
    return { recruiter: recruiter, archers: archers, chariots: chariots, infantry: infantry }
}

function run_test() {
    // Select a company once before a city load: loading drops the game's event listeners, and R must
    // still turn a company afterwards.
    var first = t332_setup()
    if (first.archers && t332_open(first.archers)) {
        t332_tap_order(1)
    }
    __log_info_native('[test:332] selected a company before reloading: window ' + __game_window_get_id())

    var setup = t332_setup()
    var recruiter = setup.recruiter
    var archers = setup.archers
    var chariots = setup.chariots
    var infantry = setup.infantry
    __log_info_native('[test:332] forts ' + archers + ' ' + chariots + ' ' + infantry + ', soldiers '
        + t332_company(archers).num_figures + ' ' + t332_company(chariots).num_figures + ' '
        + t332_company(infantry).num_figures)
    if (!recruiter || !archers || !chariots || !infantry || t332_company(archers).num_figures <= 0
        || t332_company(chariots).num_figures <= 0) {
        __test_signal_ready()
        return
    }

    var form = t332_company(archers)
    if (t332_open(archers)) {
        if (t332_pictures('archers', 6, form.is_at_fort)) {
            __log_marker('archer_order_pictures')
        }
        var level = Math.max(0, Math.min(5, (form.experience / 100) | 0))
        var title = __test_info_ui_text('title')
        var experience = __test_info_ui_text('training_num')
        __log_info_native('[test:332] title ' + JSON.stringify(title) + ', experience ' + JSON.stringify(experience))
        if (title == __loc(138, form.batalion_id - 1) + ' ' + __loc(138, 75) && experience == __loc(138, 60 + level)) {
            __log_marker('header_like_fort_window')
        }
        var header = __test_info_ui_text('layout_header')
        var desc = __test_info_ui_text('layout_desc')
        __log_info_native('[test:332] layout ' + form.layout + ': ' + JSON.stringify(header) + ' / ' + JSON.stringify(desc))
        if (header == __loc(138, 12) && desc == __loc(138, 13)) {
            __log_marker('tight_order_texts')
        }

        t332_tap_order(3)
        __log_info_native('[test:332] engage: layout ' + form.layout + ', window ' + __game_window_get_id())
        if (form.layout == T332_ENGAGE && __game_window_get_id() == 'window_city_military' && t332_open(archers)
            && __test_info_ui_text('layout_header') == __loc(138, 16)
            && __test_info_ui_text('layout_desc') == __loc(138, 17)) {
            __log_marker('engage_nearby_order')
        }
    }
    t332_close()

    var chariot_form = t332_company(chariots)
    if (t332_open(chariots)) {
        if (t332_pictures('charioteers', 12, chariot_form.is_at_fort)) {
            __log_marker('charioteer_order_pictures')
        }
        t332_tap_order(2)
        __log_info_native('[test:332] charge: layout ' + chariot_form.layout)
        if (chariot_form.layout == T332_COLUMN && t332_open(chariots)
            && __test_info_ui_text('layout_header') == __loc(138, 20)) {
            __log_marker('charioteer_charge_order')
        }
    }
    t332_close()

    if (t332_open(infantry)) {
        if (t332_pictures('infantry', 0, t332_company(infantry).is_at_fort)) {
            __log_marker('infantry_order_pictures')
        }
        var none = __test_info_ui_text('layout_desc')
        __log_info_native('[test:332] infantry with no soldiers: ' + JSON.stringify(none))
        if (none == __loc(138, 10)) {
            __log_marker('no_soldiers_text')
        }
    }
    t332_close()

    // Paused, so the daily formation update can't turn the company on its own.
    game.paused = true
    if (t332_open(archers)) {
        t332_tap_order(2)
    }
    var planner_orientation = city_planner.relative_orientation
    var before = form.layout + '/' + form.direction
    var rotate_key = t332_rotate_key()
    emit event_hotkey_key{ key: rotate_key.key, modifiers: rotate_key.modifiers, pressed: 1, repeat: 0 }
    __test_pump_frames(2)
    emit event_hotkey_key{ key: rotate_key.key, modifiers: rotate_key.modifiers, pressed: 0, repeat: 0 }
    __test_pump_frames(2)
    var after_key = form.layout + '/' + form.direction
    __log_info_native('[test:332] loose ' + before + ', after R ' + after_key + ', window ' + __game_window_get_id()
        + ', planner orientation ' + planner_orientation + ' -> ' + city_planner.relative_orientation)
    if (before == T332_SINGLE_LINE_1 + '/0' && after_key == T332_SINGLE_LINE_2 + '/2'
        && city_planner.relative_orientation == planner_orientation) {
        __log_marker('rotate_key_turns_company')
    }

    t332_tap(__test_company_rotate_button_pos())
    var after_button = form.layout + '/' + form.direction
    __log_info_native('[test:332] after Rotate button ' + after_button + ', window ' + __game_window_get_id())
    if (after_button == T332_SINGLE_LINE_1 + '/4' && __game_window_get_id() == 'window_city_military') {
        __log_marker('rotate_button_turns_company')
    }
    game.paused = false

    t332_close()
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    var markers = ['archer_order_pictures', 'charioteer_order_pictures', 'infantry_order_pictures',
        'header_like_fort_window', 'tight_order_texts', 'engage_nearby_order', 'charioteer_charge_order',
        'no_soldiers_text', 'rotate_key_turns_company', 'rotate_button_turns_company']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            return false
        }
    }
    return true
}
