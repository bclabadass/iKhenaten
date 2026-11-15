// Population milestones. Each milestone message names one of Pharaoh's message pictures (Unloaded group 16,
// frame 16), but it opened in the general window, which looked the picture up as a numbered message image
// and had no room for it, so no picture showed. It now opens in the picture layout (picture on top, text
// under it, title at the bottom). And the shown-milestone flags were one-bit fields in a union, all the same
// bit, so after the first milestone no other was ever announced; they are now one byte each, as original
// saves keep them. The ink check needs the Pharaoh art; without it it reports itself skipped.
// Markers:
//   [test-marker] milestone_picture_window
//   [test-marker] milestone_picture_above_text
//   [test-marker] milestone_not_repeated
//   [test-marker] milestones_each_announced
//   [test-marker] numbered_picture_stays_general
//   [test-marker] milestone_picture_drawn
//   [test-marker] art_checks_skipped

var T333_SECTION = 'message_dialog_window_image'

// Keys of the messages posted by reaching `population`, space-separated.
function t333_reach(population) {
    var before = __city_message_count()
    __test_set_city_population(population)
    __test_population_check_milestone()
    __test_process_events()
    __test_pump_frames(6)
    var posted = ''
    for (var i = before; i < __city_message_count(); i++) {
        posted += (posted ? ' ' : '') + __lang_get_message_id(__city_message_mm_text_id(i))
    }
    return posted
}

function t333_close_dialog() {
    if (ui.window_is('window_message_dialog')) {
        window_go_back()
        __test_pump_frames(3)
    }
}

// Dark (ink) pixels in the picture area: the picture is an ink sketch, the panel behind it has none.
function t333_picture_ink() {
    var at = __test_window_element_screen_pos(T333_SECTION, 'image')
    var size = __test_window_element_size(T333_SECTION, 'image')
    var dark = 0
    for (var y = at.y; y < at.y + size.y; y += 4) {
        for (var x = at.x + 16; x < at.x + size.x - 16; x += 4) {
            var c = __test_screen_pixel(x, y)
            if (c >= 0 && ((c >> 16) & 255) + ((c >> 8) & 255) + (c & 255) < 200) {
                dark++
            }
        }
    }
    return dark
}

function run_test() {
    test_reload_city_session('data/default.map')
    var saved_scale = __display_options_get_scale()
    __display_options_set_scale(100)
    __test_pump_frames(5)

    var art = get_image({ pack: PACK_UNLOADED, id: 16, offset: 16 }) != null

    var first = t333_reach(150)
    var section = __test_message_dialog_section()
    var picture = __test_window_element_image(T333_SECTION, 'image')
    __log_info_native('[test:333] 150 posted "' + first + '", window ' + section + ', picture ' + picture)
    if (first == 'message_population_milestone_100' && section == T333_SECTION && picture == PACK_UNLOADED + ',16,16') {
        __log_marker('milestone_picture_window')
    }

    var bg = __test_window_element_size(T333_SECTION, 'background')
    var img_at = __test_window_element_screen_pos(T333_SECTION, 'image')
    var img_size = __test_window_element_size(T333_SECTION, 'image')
    var panel_at = __test_window_element_screen_pos(T333_SECTION, 'content_panel')
    var title_at = __test_window_element_screen_pos(T333_SECTION, 'title')
    __log_info_native('[test:333] background ' + bg.x + 'x' + bg.y + ', picture ' + img_at.y + '+' + img_size.y
        + ', panel ' + panel_at.y + ', title ' + title_at.y)
    if (section == T333_SECTION && bg.x == 30 && bg.y == 28 && img_at.y + img_size.y <= panel_at.y && title_at.y > panel_at.y) {
        __log_marker('milestone_picture_above_text')
    }

    if (!art) {
        __log_marker('art_checks_skipped')
    } else {
        var ink = t333_picture_ink()
        __log_info_native('[test:333] picture ink ' + ink)
        if (section == T333_SECTION && ink > 20) {
            __log_marker('milestone_picture_drawn')
        }
    }
    t333_close_dialog()

    var again = t333_reach(150)
    __log_info_native('[test:333] 150 again posted "' + again + '"')
    if (again == '') {
        __log_marker('milestone_not_repeated')
    }

    var later = []
    var pops = [600, 1200, 2500]
    for (var i = 0; i < pops.length; i++) {
        later.push(t333_reach(pops[i]))
        t333_close_dialog()
    }
    __log_info_native('[test:333] later posted "' + later.join('" "') + '"')
    if (later.join(',') == 'message_population_milestone_500,message_population_milestone_1000,message_population_milestone_2000') {
        __log_marker('milestones_each_announced')
    }

    ui.window_message_dialog_show('message_table_of_contents')
    __test_pump_frames(3)
    var toc = __test_message_dialog_section()
    __log_info_native('[test:333] table of contents window ' + toc)
    if (toc == 'message_dialog_window_general') {
        __log_marker('numbered_picture_stays_general')
    }
    t333_close_dialog()

    __display_options_set_scale(saved_scale)
    __test_signal_ready()
}

function check_valid() {
    var ok = __test_find_inlog('[test-marker] milestone_picture_window')
        && __test_find_inlog('[test-marker] milestone_picture_above_text')
        && __test_find_inlog('[test-marker] milestone_not_repeated')
        && __test_find_inlog('[test-marker] milestones_each_announced')
        && __test_find_inlog('[test-marker] numbered_picture_stays_general')
    return ok && (__test_find_inlog('[test-marker] milestone_picture_drawn') || __test_find_inlog('[test-marker] art_checks_skipped'))
}
