// Ship orders and boarding work by touch. A tap on a warship or transport selects it to move, and its orders panel
// (Pharaoh's right-click) had no way in on touch, so troops could not be boarded (Brendan on the Duo, Abdjedu 11).
// While a ship is selected an Orders button now opens its panel, as for companies. The transport's panel has
// Pharaoh's orders (Transport Ship help; Pharaoh_Unloaded group 38): Hold Position, Evade Enemies,
// Embark/Disembark (one place, whichever fits), Repair, Return to Wharf. Embark then takes a tap on the company,
// found within two tiles as when selecting a company to move.
// Markers:
//   [test-marker] ship_orders_button_opens_panel
//   [test-marker] transport_order_buttons
//   [test-marker] embark_taps_company_nearby
//   [test-marker] transport_hold_order
//   [test-marker] warship_order_by_touch

function t351_tap(p) {
    __test_touch_down(1, p.x, p.y)
    __test_pump_frames(2)
    __test_touch_up(1, p.x, p.y)
    __test_pump_frames(6)
}

function t351_tap_info(id) {
    var pos = __test_info_ui_screen_pos(id)
    var size = __test_window_element_size('figure_transport_ship_info_window', id)
    t351_tap({ x: pos.x + ((Math.max(size.x, 24) / 2) | 0), y: pos.y + ((Math.max(size.y, 24) / 2) | 0) })
}

// A screen pixel over the tile (as tests 285/287 find one), or null when it isn't on screen.
function t351_tile_pixel(t) {
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

function t351_tap_tile(t) {
    var p = t351_tile_pixel(t)
    if (p) {
        t351_tap(p)
    }
    return p
}

function t351_place(type, x, y) {
    if (!__scenario_building_allowed(type)) {
        __scenario_building_allow(type, true)
    }
    var bid = test_building_place(type, x, y)
    test_planner_exit_build_mode()
    return bid
}

// A transport docked at a transport wharf on open water (as test 349).
function t351_transport() {
    __scenario_building_allow(BUILDING_TRANSPORT_WHARF, true)
    var wharf = test_shoreline_building_place(BUILDING_TRANSPORT_WHARF, 2)
    if (!wharf) {
        return 0
    }
    __test_building_set_workers(wharf, 20)
    __test_building_force_road_access(wharf)
    var cx = (__scenario_map.width / 2) | 0, cy = (__scenario_map.height / 2) | 0
    for (var wy = cy + 1; wy <= cy + 9; wy++) {
        for (var wx = cx - 8; wx <= cx + 8; wx++) {
            terrain.set_water({ x: wx, y: wy })
        }
    }
    __test_set_scenario_river_points(cx, cy + 5, cx, cy + 6)
    __map_water_cache_river_tiles()
    __map_water_rebuild_shores()
    __test_map_routing_update_water()
    __test_transport_wharf_update_month(wharf)
    var access = __test_wharf_water_access(wharf)
    if (access < 0) {
        return 0
    }
    var berth = { x: Math.floor(access / 1000), y: access % 1000 }
    var ship = test_figure_create(FIGURE_TRANSPORT_SHIP, berth.x, berth.y)
    __test_figure_set_home(ship, wharf)
    __test_figure_set_destination_tile(ship, berth.x, berth.y)
    __test_figure_set_action(ship, ACTION_213_TRANSPORT_SHIP_DOCKED)
    __test_building_set_figure_slot(wharf, BUILDING_SLOT_BOAT, ship)
    return ship
}

// A tile two away from the company's soldiers, off its fort: a tap there only finds the company by searching.
function t351_near_company(form_id) {
    var tiles = []
    for (var f = 1; f < 3000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == FIGURE_ARCHER && __test_figure_get_formation_id(f) == form_id) {
            tiles.push(__figure_get_tile(f))
        }
    }
    var dirs = [[2, 0], [0, 2], [-2, 0], [0, -2], [2, 2], [-2, -2]]
    for (var i = 0; i < tiles.length; i++) {
        for (var d = 0; d < dirs.length; d++) {
            var c = { x: tiles[i].x + dirs[d][0], y: tiles[i].y + dirs[d][1] }
            var clear = !__map_terrain_is(c, TERRAIN_BUILDING)
            for (var j = 0; j < tiles.length && clear; j++) {
                clear = Math.max(Math.abs(tiles[j].x - c.x), Math.abs(tiles[j].y - c.y)) >= 2
            }
            if (clear) {
                return c
            }
        }
    }
    return null
}

function run_test() {
    test_reload_city_session('data/default.map')
    __test_set_treasury(100000)
    var ship = t351_transport()
    __scenario_building_allow(BUILDING_FORT_GROUND, true)
    var recruiter = t351_place(BUILDING_RECRUITER, 36, 40)
    var archers = t351_place(BUILDING_FORT_ARCHERS, 44, 40)
    __test_fort_update_recruit_status(archers)
    for (var i = 0; i < 3; i++) {
        __test_recruiter_create_soldier(recruiter)
    }
    // The soldiers on parade beside the fort, standing still.
    var n = 0
    for (var q = 1; q < 3000; q++) {
        if (__figure_is_valid(q) && __figure_get_type(q) == FIGURE_ARCHER) {
            __test_figure_place(q, ((__scenario_map.width / 2) | 0) - 12 + n, ((__scenario_map.height / 2) | 0) - 6)
            __test_figure_set_action(q, 0)
            n++
        }
    }
    __test_pump_frames(2)
    var form_id = archers ? city.get_building(archers).formation_id : 0
    var where = []
    for (var f = 1; f < 3000; f++) {
        if (__figure_is_valid(f) && __figure_get_type(f) == FIGURE_ARCHER) {
            where.push(f + '@' + JSON.stringify(__figure_get_tile(f)) + ' form ' + __test_figure_get_formation_id(f))
        }
    }
    __log_info_native('[test:351] archers ' + where.join(' ') + ', recruiter ' + recruiter + ', fort ' + JSON.stringify(archers ? __building_tile(archers) : null))
    if (!ship || !form_id) {
        __log_info_native('[test:351] setup failed: ship ' + ship + ' company ' + form_id)
        __test_signal_ready()
        return
    }

    // Select the transport to move, then tap Orders.
    __camera_go_to_bookmark_tile(__figure_get_tile(ship))
    __test_pump_frames(2)
    __window_city_transport_show(ship, TRANSPORT_PICK_MOVE)
    __test_pump_frames(2)
    t351_tap(__test_company_orders_button_pos())
    var section = __test_info_window_section()
    __log_info_native('[test:351] Orders with the transport selected: window ' + __game_window_get_id() + ' panel '
        + section + ' figure ' + __object_info_figure_id() + ' (ship ' + ship + ')')
    if (section == 'figure_transport_ship_info_window' && __object_info_figure_id() == ship) {
        __log_marker('ship_orders_button_opens_panel')
    } else {
        __test_signal_ready()
        return
    }

    var ids = ['hold_position', 'evade', 'embark', 'disembark', 'repair', 'return_to_wharf']
    var pictures = []
    for (var k = 0; k < ids.length; k++) {
        pictures.push(__test_info_ui_enabled(ids[k]) ? __test_info_ui_image_offset(ids[k]) : 'off')
    }
    __log_info_native('[test:351] transport order pictures (group 38): ' + JSON.stringify(pictures))
    if (JSON.stringify(pictures) == JSON.stringify([0, 1, 2, 'off', 4, 5])) {
        __log_marker('transport_order_buttons')
    }

    // Embark, then tap beside the company.
    t351_tap_info('embark')
    var mode = __game_window_get_id()
    var near = t351_near_company(form_id)
    if (near) {
        __camera_go_to_bookmark_tile(near)
        __test_pump_frames(2)
        if (!t351_tap_tile(near)) {
            near = null
        }
    }
    // Embark taken: the ship heads for the company (218, going to the company; Embark stays open while it waits).
    var going = __figure_get_action_state(ship)
    __log_info_native('[test:351] Embark: window ' + mode + ', tapped ' + JSON.stringify(near) + ' beside company '
        + form_id + ': ship action ' + going + ', window now ' + __game_window_get_id())
    if (mode == 'window_city_transport' && near && going == 218) {
        __log_marker('embark_taps_company_nearby')
    }

    // Hold Position from the panel.
    __window_city_transport_show(ship, TRANSPORT_PICK_MOVE)
    __test_pump_frames(2)
    t351_tap(__test_company_orders_button_pos())
    __log_info_native('[test:351] second Orders: window ' + __game_window_get_id() + ' panel ' + __test_info_window_section())
    t351_tap_info('hold_position')
    __log_info_native('[test:351] Hold position: order ' + city.get_transport_ship(ship).order)
    if (city.get_transport_ship(ship).order == 1) {
        __log_marker('transport_hold_order')
    }

    // A warship the same way; its order buttons used to fail (the handler read a missing argument).
    var water = __figure_get_tile(ship)
    var warship = test_figure_create(FIGURE_WARSHIP, water.x + 2, water.y + 2)
    __test_figure_set_action(warship, ACTION_20_WARSHIP_DOCKED)
    __window_city_warship_show(warship)
    __test_pump_frames(2)
    t351_tap(__test_company_orders_button_pos())
    var wsection = __test_info_window_section()
    if (wsection == 'figure_warship_info_window') {
        var pos = __test_info_ui_screen_pos('seek_and_destroy')
        var size = __test_window_element_size('figure_warship_info_window', 'seek_and_destroy')
        t351_tap({ x: pos.x + ((Math.max(size.x, 24) / 2) | 0), y: pos.y + ((Math.max(size.y, 24) / 2) | 0) })
    }
    var worder = city.get_warship(warship).active_order
    __log_info_native('[test:351] warship Orders: panel ' + wsection + ', after Seek and destroy the order is ' + worder)
    if (wsection == 'figure_warship_info_window' && worder == 4) {
        __log_marker('warship_order_by_touch')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] ship_orders_button_opens_panel')
        && __test_find_inlog('[test-marker] transport_order_buttons')
        && __test_find_inlog('[test-marker] embark_taps_company_nearby')
        && __test_find_inlog('[test-marker] transport_hold_order')
        && __test_find_inlog('[test-marker] warship_order_by_touch')
}
