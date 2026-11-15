// The mortuary. Tapping it opened the shared health panel, which showed a missing text ("#82.6") as its warning
// and no linen. It now opens its own panel: the description, the linen in stock, and whether it works (82.2 no
// staff, 82.4 no linen, 82.3 working). Its work animation needed 100 linen, though it sends embalmers with the
// linen for one; it now plays whenever it can work. Its linen in stock was drawn with the reeds picture (General
// group 206); it now uses the linen bolts (group 199, a growing pile). Seven warning keys of group 19 pointed 2-4
// texts early (the mortuary's "Build a Weaver" read "Build a Brewery"); that check needs the Pharaoh texts and is
// otherwise skipped.
// Markers:
//   [test-marker] mortuary_own_panel
//   [test-marker] mortuary_panel_texts
//   [test-marker] mortuary_panel_layout
//   [test-marker] mortuary_animates_while_working
//   [test-marker] mortuary_linen_picture
//   [test-marker] warning_texts_match
//   [test-marker] warning_texts_skipped

var T334_SECTION = 'info_window_mortuary'

function t334_staff(bid, workers) {
    __test_building_force_road_access(bid)
    __test_building_set_workers(bid, workers)
}

function t334_set_linen(b, amount) {
    var have = b.stored_resource(RESOURCE_LINEN)
    if (have > amount) {
        b.consume_resource(RESOURCE_LINEN, have - amount)
    } else if (have < amount) {
        b.store_resource(RESOURCE_LINEN, amount - have)
    }
}

// The panel's section and texts for the mortuary staffed with `workers` and holding `linen`.
function t334_panel(bid, workers, linen) {
    var b = city.get_building(bid)
    t334_set_linen(b, linen)
    t334_staff(bid, workers)
    __test_show_tile_info(bid)
    __test_pump_frames(2)
    var shown = {
        section: __test_info_window_section(),
        warning: __test_info_ui_text('warning_text'),
        stored: __test_info_ui_text('resource_stored'),
        reason: __test_info_ui_text('workers_desc'),
        warning_at: __test_info_ui_screen_pos('warning_text'),
        stored_at: __test_info_ui_screen_pos('resource_stored'),
        panel_at: __test_info_ui_screen_pos('inner_panel'),
    }
    window_go_back()
    __test_pump_frames(2)
    __log_info_native('[test:334] workers ' + workers + ' linen ' + linen + ': ' + shown.section + ' | ' + shown.stored + ' | ' + shown.reason)
    return shown
}

function t334_animates(bid, workers, linen) {
    var b = city.get_building(bid)
    t334_set_linen(b, linen)
    t334_staff(bid, workers)
    __test_building_update_day(bid)
    return b.play_animation
}

function run_test() {
    test_reload_city_session('data/default.map')
    __display_options_set_scale(100)
    __scenario_building_allow(BUILDING_MORTUARY, true)
    __test_set_treasury(50000)
    __test_pump_frames(3)

    var bid = test_building_place(BUILDING_MORTUARY, -1, -1)
    if (!bid) {
        __log_info_native('[test:334] mortuary not placed')
        __test_signal_ready()
        return
    }
    var cost = building_mortuary_walker_cost()

    var working = t334_panel(bid, 8, 200)
    var no_linen = t334_panel(bid, 8, 0)
    var no_staff = t334_panel(bid, 0, 200)

    if (working.section == T334_SECTION && no_linen.section == T334_SECTION && no_staff.section == T334_SECTION) {
        __log_marker('mortuary_own_panel')
    }
    if (working.warning == __loc(82, 1) && working.stored == '200' + __loc(66, 122) && no_linen.stored == '0' + __loc(66, 122)
        && working.reason == __loc(82, 3) && no_linen.reason == __loc(82, 4) && no_staff.reason == __loc(82, 2)) {
        __log_marker('mortuary_panel_texts')
    }

    // The description runs to three lines; the linen line and the staff box sit under it.
    __log_info_native('[test:334] layout warning y ' + working.warning_at.y + ', stored y ' + working.stored_at.y + ', staff box y ' + working.panel_at.y)
    if (working.warning_at.y > 0 && working.stored_at.y >= working.warning_at.y + 48 && working.panel_at.y >= working.stored_at.y + 20) {
        __log_marker('mortuary_panel_layout')
    }

    var anim_one = t334_animates(bid, 8, cost)
    var anim_short = t334_animates(bid, 8, cost - 1)
    var anim_full = t334_animates(bid, 8, 200)
    var anim_unstaffed = t334_animates(bid, 0, 200)
    __log_info_native('[test:334] embalmer costs ' + cost + ' linen; animates at ' + cost + ': ' + anim_one + ', at ' + (cost - 1) + ': '
        + anim_short + ', at 200: ' + anim_full + ', unstaffed: ' + anim_unstaffed)
    if (anim_one && !anim_short && anim_full && !anim_unstaffed) {
        __log_marker('mortuary_animates_while_working')
    }

    var linen_pic = building_mortuary.overlay_anims.linen
    __log_info_native('[test:334] linen picture ' + linen_pic.pack + '/' + linen_pic.id + ', ' + (linen_pic.stack ? 'stacked' : 'pile'))
    if (linen_pic.pack == PACK_GENERAL && linen_pic.id == 199 && !linen_pic.stack) {
        __log_marker('mortuary_linen_picture')
    }

    if (__loc(19, 193).indexOf('#') == 0) {
        __log_marker('warning_texts_skipped')
    } else {
        var keys = [['#mausoleum_needs_sandstone', 188], ['#build_brewery_or_import_beer', 189], ['#build_papyrus_maker_or_import', 191],
                    ['#build_weaver_or_import_linen', 193], ['#tax_collector_robbed', 195], ['#courthouse_robbed', 196], ['#mansion_destroyed', 197]]
        var wrong = []
        for (var i = 0; i < keys.length; i++) {
            if (__loc({ key: keys[i][0] }) != __loc(19, keys[i][1])) {
                wrong.push(keys[i][0] + ' = "' + __loc({ key: keys[i][0] }) + '"')
            }
        }
        __log_info_native('[test:334] wrong warning texts: ' + (wrong.length ? wrong.join('; ') : 'none'))
        if (!wrong.length) {
            __log_marker('warning_texts_match')
        }
    }

    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] mortuary_own_panel')
        && __test_find_inlog('[test-marker] mortuary_panel_texts')
        && __test_find_inlog('[test-marker] mortuary_panel_layout')
        && __test_find_inlog('[test-marker] mortuary_animates_while_working')
        && __test_find_inlog('[test-marker] mortuary_linen_picture')
        && (__test_find_inlog('[test-marker] warning_texts_match') || __test_find_inlog('[test-marker] warning_texts_skipped'))
}
