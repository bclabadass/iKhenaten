// The Military overseer lists every company with its standard, name, soldiers, morale, experience and
// its Go to / Return to fort / Kingdom service buttons. Each row was drawn by a function that named the
// row's x position `px`, hiding the px() helper it called on its first line, so every row stopped with
// a script error and the list came out empty. Go to also needs the company's position. The summary
// reads "6 Soldiers in 2 Companies" (it was "Soldier 6 in 2 Companies"). Return to fort brings a
// company that was sent out back to its fort.
// Markers:
//   [test-marker] overseer_rows_drawn
//   [test-marker] overseer_summary_text
//   [test-marker] overseer_return_to_fort
//   [test-marker] overseer_goto_company

function t331_tile_center(tile) {
    var sum_x = 0
    var sum_y = 0
    var n = 0
    for (var py = 40; py < screen.height - 40; py += 3) {
        for (var px = 10; px < screen.width - 200; px += 6) {
            var st = __pixel_to_screentile({ x: px, y: py })
            if (st.x == -1 || st.y == -1) {
                continue
            }
            var t = __screen_to_tile(st)
            if (t.x == tile.x && t.y == tile.y) {
                sum_x += px
                sum_y += py
                n++
            }
        }
    }
    return n ? { x: (sum_x / n) | 0, y: (sum_y / n) | 0 } : null
}

function t331_place(type) {
    if (!__scenario_building_allowed(type)) {
        __scenario_building_allow(type, true)
    }
    var bid = test_building_place(type, -1, -1)
    test_planner_exit_build_mode()
    return bid
}

function t331_errors_since(fence) {
    var errors = __game_recent_log_errors(40)
    var at = errors.lastIndexOf(fence)
    return at < 0 ? errors : errors.substring(at + fence.length)
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    city.set_advisor_available(ADVISOR_MILITARY, 1)
    __scenario_building_allow(BUILDING_FORT_GROUND, true)
    var fort = t331_place(BUILDING_FORT_ARCHERS)
    var recruiter = t331_place(BUILDING_RECRUITER)
    if (!fort || !recruiter) {
        __log_info_native('[test:331] place failed fort ' + fort + ' recruiter ' + recruiter)
        __test_signal_ready()
        return
    }
    __test_fort_update_recruit_status(fort)
    for (var i = 0; i < 3; i++) {
        __test_recruiter_create_soldier(recruiter)
    }
    __test_pump_frames(3)
    var form = city.get_battalion_by_index(0)
    __log_info_native('[test:331] forts ' + city.num_forts + ', company 0: ' + form.num_figures + ' soldiers, morale '
        + form.morale + ', experience ' + form.experience + ', at fort ' + form.is_at_fort + ', home '
        + JSON.stringify(form.home))

    var fence = '[test:331] overseer fence'
    __log_warning_native(fence)
    window_advisors_show_advisor(ADVISOR_MILITARY)
    __test_pump_frames(5)
    var errors = t331_errors_since(fence)
    __log_info_native('[test:331] window ' + __game_window_get_id() + ', errors after opening: ' + JSON.stringify(errors))
    if (city.num_forts == 1 && form.num_figures > 0 && errors.indexOf('rror') < 0) {
        __log_marker('overseer_rows_drawn')
    }

    var summary = __test_window_element_text('advisor_military_window', 'forts_text')
    var soldiers = city.military.total_soldiers
    var want = soldiers + ' ' + __loc(8, soldiers == 1 ? 46 : 47) + ' ' + __loc(51, 7) + ' 1 ' + __loc(8, 48)
    __log_info_native('[test:331] summary ' + JSON.stringify(summary) + ', want ' + JSON.stringify(want))
    if (soldiers > 1 && summary == want && __loc(8, 47) != __loc(8, 46)) {
        __log_marker('overseer_summary_text')
    }

    var home = form.home
    var list = __test_window_element_screen_pos('advisor_military_window', 'forts_list')
    var fid = city.get_building(fort).formation_id
    // Paused, so the daily formation update can't mark the company at its fort on its own.
    game.paused = true
    var away = [[0, 6], [6, 0], [0, -6], [-6, 0], [4, 4], [-4, -4]]
    for (var a = 0; a < away.length && form.is_at_fort; a++) {
        __test_company_move_to(fid, home.x + away[a][0], home.y + away[a][1])
    }
    __test_pump_frames(3)
    var sent_out = !form.is_at_fort
    __test_mouse_click(list.x + 426 + 15, list.y + 7 + 15)
    __test_pump_frames(3)
    __log_info_native('[test:331] sent out ' + sent_out + ', at fort after Return to fort ' + form.is_at_fort
        + ', window ' + __game_window_get_id())
    if (sent_out && form.is_at_fort) {
        __log_marker('overseer_return_to_fort')
    }
    game.paused = false

    var goto_point = { x: list.x + 356 + 15, y: list.y + 7 + 15 }
    __camera_scroll(-4000, -4000)
    __test_pump_frames(2)
    var before = home ? t331_tile_center(home) : null
    __log_info_native('[test:331] list at ' + JSON.stringify(list) + ', home on screen before ' + JSON.stringify(before))
    __test_mouse_click(goto_point.x, goto_point.y)
    __test_pump_frames(5)
    var after = home ? t331_tile_center(home) : null
    var window_id = __game_window_get_id()
    __log_info_native('[test:331] go to: window ' + window_id + ', home on screen after ' + JSON.stringify(after)
        + ', view ' + screen.width + 'x' + screen.height)
    if (!before && after && Math.abs(after.x - screen.width / 2) < screen.width / 3
        && Math.abs(after.y - screen.height / 2) < screen.height / 3) {
        __log_marker('overseer_goto_company')
    }

    ui.window_city_show()
    __test_pump_frames(2)
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    var markers = ['overseer_rows_drawn', 'overseer_summary_text', 'overseer_return_to_fort', 'overseer_goto_company']
    for (var i = 0; i < markers.length; i++) {
        if (!__test_find_inlog('[test-marker] ' + markers[i])) {
            return false
        }
    }
    return true
}
