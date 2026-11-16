// A company that rode a transport still returns to its fort, and a tap by the ship means the ship (Brendan on the
// Duo: after landing, Return to Fort took the company to the wharf and all but one soldier died; a tap on the
// company's standard over the water showed the company's panel, not the transport).
// - A company's tile is its fort's ground, where Return to Fort takes it; boarding, every tick aboard and landing
//   moved it to the ship and the landing, so the company "returned" to the water. Only the standard moves now (and
//   a fort puts its company's tile back on load, for saves made before).
// - A company's home follows its first soldier, and Return to Fort routes from it; aboard that was the ship's water
//   tile, so a return just after landing did nothing. Home no longer follows a soldier aboard.
// - The standard of a company aboard is drawn below the ship, a tile off; a tap there found the standard in the
//   tile's info. A tap a tile off a ship now selects the ship (after companies on land).
// Markers:
//   [test-marker] company_tile_stays_at_fort
//   [test-marker] home_not_taken_aboard
//   [test-marker] tap_beside_ship_selects_ship

function t361_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

function t361_tile_pixel(t) {
    for (var py = 40; py < screen.height - 40; py += 3) {
        for (var px = 10; px < screen.width - 200; px += 6) {
            var st = __pixel_to_screentile({ x: px, y: py })
            if (st.x == -1 || st.y == -1) {
                continue
            }
            var at = __screen_to_tile(st)
            if (at.x == t.x && at.y == t.y) {
                return { x: px, y: py }
            }
        }
    }
    return null
}

function t361_same(a, b) {
    return a && b && a.x == b.x && a.y == b.y
}

function run_test() {
    test_reload_city_session('data/default.map')
    var ship = __test_player_transport_spawn_for_embark(4)
    var company = __test_player_transport_company_id()
    if (!ship || !company) {
        __log_info_native('[test:361] setup failed')
        __test_signal_ready()
        return
    }
    var st = __figure_get_tile(ship)
    var flag = test_figure_create(FIGURE_STANDARD_BEARER, st.x, st.y - 2)
    __test_figure_set_formation_id(flag, company)
    var form = city.get_formation(company)
    var fort_tile = form.tile

    __transport_ship_embark(ship, company)
    for (var i = 0; i < 40 && !__transport_ship_has_troops(ship); i++) {
        __test_figure_action_perform(ship)
    }
    // Long enough for the daily formation update, which moves home to the first soldier.
    __test_pump_frames(400)
    var aboard_tile = form.tile
    var aboard_home = null
    for (var bi = 0; bi < 6; bi++) {
        var bt = city.get_battalion_by_index(bi)
        if (bt.batalion_id == form.batalion_id && bt.num_figures > 0) {
            aboard_home = bt.home
        }
    }
    __log_info_native('[test:361] company tile ' + JSON.stringify(fort_tile) + ', aboard ' + JSON.stringify(aboard_tile)
        + ', home aboard ' + JSON.stringify(aboard_home) + ' (ship ' + JSON.stringify(st) + ')')
    if (__transport_ship_has_troops(ship) && aboard_home && !t361_same(aboard_home, st)
        && !__map_terrain_is(aboard_home, TERRAIN_WATER)) {
        __log_marker('home_not_taken_aboard')
    }

    // A tap on the water a tile below the ship, where the standard is drawn.
    game.paused = true
    ui.window_city_show()
    __test_pump_frames(2)
    var below = null
    var dirs = [[0, 1], [1, 1], [1, 0], [-1, 1], [0, -1], [-1, 0]]
    for (var d = 0; d < dirs.length && !below; d++) {
        var c = { x: st.x + dirs[d][0], y: st.y + dirs[d][1] }
        if (__map_terrain_is(c, TERRAIN_WATER) && !__map_terrain_is(c, TERRAIN_BUILDING)) {
            below = c
        }
    }
    var window = 'none'
    if (below) {
        city.camera_go_to(below)
        __test_pump_frames(3)
        var p = t361_tile_pixel(below)
        if (p) {
            t361_tap(p)
            window = __game_window_get_id()
        }
    }
    __log_info_native('[test:361] tap a tile off the loaded ship ' + JSON.stringify(below) + ' opens ' + window
        + (window == 'window_building_info' ? ' ' + __test_info_window_section() : ''))
    if (window == 'window_city_transport') {
        __log_marker('tap_beside_ship_selects_ship')
    }
    ui.window_city_show()
    __test_pump_frames(2)
    game.paused = false

    // Land them (the ship's own tile is by the shore in this setup).
    __transport_ship_sail_to(ship, st.x, st.y)
    for (var j = 0; j < 20 && __transport_ship_has_troops(ship); j++) {
        __test_figure_action_perform(ship)
    }
    var landed_tile = form.tile
    __log_info_native('[test:361] troops aboard after landing ' + __transport_ship_has_troops(ship) + ', company tile '
        + JSON.stringify(landed_tile))
    if (!__transport_ship_has_troops(ship) && t361_same(aboard_tile, fort_tile) && t361_same(landed_tile, fort_tile)) {
        __log_marker('company_tile_stays_at_fort')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] company_tile_stays_at_fort')
        && __test_find_inlog('[test-marker] home_not_taken_aboard')
        && __test_find_inlog('[test-marker] tap_beside_ship_selects_ship')
}
