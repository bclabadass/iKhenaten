log_info("akhenaten: ui figure transport ship window started")

function figure_transport_ship_company_on_board_text_id(figure_type) {
    if (figure_type == FIGURE_ARCHER) { return 31 }
    if (figure_type == FIGURE_FCHARIOTEER) { return 32 }
    if (figure_type == FIGURE_INFANTRY) { return 33 }
    return 33
}

function figure_transport_ship_onboard_text(ship) {
    if (!ship.valid || !ship.has_troops) {
        return ""
    }

    var form = city.get_formation(ship.transported_formation)
    if (!form || !form.in_use) {
        return ""
    }

    var company_id = figure_transport_ship_company_on_board_text_id(form.figure_type)
    return __loc(184, company_id) + " " + __loc(184, 34)
}

var TRANSPORT_ORDER_HOLD = 1
var TRANSPORT_ORDER_EVADE = 2
var TRANSPORT_ORDER_REPAIR = 3
var TRANSPORT_ORDER_RETURN_TO_WHARF = 4

// Pharaoh's transport orders (Transport Ship help): Hold Position, Evade Enemies, Embark/Disembark, Repair, Return
// to Wharf. Pictures are Pharaoh_Unloaded group 38, texts group 184.
var figure_transport_order_buttons = [
    { id: "hold_position", order: TRANSPORT_ORDER_HOLD, header: 19, text: 20 },
    { id: "evade", order: TRANSPORT_ORDER_EVADE, header: 21, text: 22 },
    { id: "embark", order: 0, header: 23, text: 24 },
    { id: "disembark", order: 0, header: 25, text: 26 },
    { id: "repair", order: TRANSPORT_ORDER_REPAIR, header: 15, text: 16 },
    { id: "return_to_wharf", order: TRANSPORT_ORDER_RETURN_TO_WHARF, header: 17, text: 18 },
]

function figure_transport_order_entry(id) {
    for (var i = 0; i < figure_transport_order_buttons.length; i++) {
        if (figure_transport_order_buttons[i].id == id) {
            return figure_transport_order_buttons[i]
        }
    }
    return null
}

function figure_transport_ship_action_text(window, ship) {
    var shown = null
    for (var i = 0; i < figure_transport_order_buttons.length; i++) {
        var entry = figure_transport_order_buttons[i]
        var btn = window[entry.id]
        if (btn && btn.hovered && btn.enabled) {
            shown = entry
        }
    }
    if (!shown) {
        for (var j = 0; j < figure_transport_order_buttons.length; j++) {
            if (figure_transport_order_buttons[j].order && figure_transport_order_buttons[j].order == ship.order) {
                shown = figure_transport_order_buttons[j]
            }
        }
    }
    if (!shown) {
        shown = figure_transport_order_entry(ship.has_troops ? "disembark" : "embark")
    }
    return { header: __loc(184, shown.header), text: __loc(184, shown.text) }
}

[es=figure_info_window]
figure_transport_ship_info_window {
    related_figures [FIGURE_TRANSPORT_SHIP]

    ui {
        background       : outer_panel({size: [29, 23]}),
        name             : text_center({pos: [16, 16], size: [px(27), 20], text:"${figure.class_name}", font : FONT_LARGE_BLACK_ON_DARK }),
        // Set in window_info_background: group 184 is the port's English text, which "${184.2}" doesn't reach.
        hullstrength_lb  : text({pos: [102, 58] }),
        hullstrength_val : text({pos: [232, 58], text:"" }),
        onboard          : text({pos: [102, 88], text:"", font : FONT_NORMAL_BLACK_ON_DARK }),

        hold_position    : image_button({param1:1, pos:[87 * 0 + 16, 134], pack:PACK_UNLOADED, id:38, offset:0, offset_pressed:0, offset_focused:0, border:true, onclick_event:"set_order" }),
        evade            : image_button({param1:2, pos:[87 * 1 + 16, 134], pack:PACK_UNLOADED, id:38, offset:1, offset_pressed:0, offset_focused:0, border:true, onclick_event:"set_order" }),
        embark           : image_button({pos:[87 * 2 + 16, 134], pack:PACK_UNLOADED, id:38, offset:2, offset_pressed:0, offset_focused:0, border:true, onclick_event:"embark" }),
        disembark        : image_button({pos:[87 * 2 + 16, 134], pack:PACK_UNLOADED, id:38, offset:3, offset_pressed:0, offset_focused:0, border:true, onclick_event:"disembark" }),
        repair           : image_button({param1:3, pos:[87 * 3 + 16, 134], pack:PACK_UNLOADED, id:38, offset:4, offset_pressed:0, offset_focused:0, border:true, onclick_event:"set_order" }),
        return_to_wharf  : image_button({param1:4, pos:[87 * 4 + 16, 134], pack:PACK_UNLOADED, id:38, offset:5, offset_pressed:0, offset_focused:0, border:true, onclick_event:"set_order" }),

        inner_panel      : inner_panel({pos : [16, 220], size: [27, 6],
            ui : {
                action_header: text({pos: [10, 10], font : FONT_NORMAL_WHITE_ON_DARK }),
                action_text : text({pos: [10, 30], font : FONT_NORMAL_BLACK_ON_DARK, wrap:px(21), multiline:true }),
            }
        }),

        button_help      : help_button({}),
        button_close     : close_button({}),
        show_follow      : button({margin:{right:-64, bottom:-40}, size:[23, 23], text:"F", tooltip:"#follow_walker", onclick_event: "show_follow"}),
    }
}

[es=(figure_transport_ship_info_window, init)]
function figure_transport_ship_info_window_init(window) {
    var fid = __object_info_figure_id()
    __figure_info_set_help(fid)
    window.name.text = city.get_figure(fid).class_name
}

[es=(figure_transport_ship_info_window, set_order)]
function figure_transport_ship_info_window_on_set_order(ev) {
    var ship = city.get_transport_ship(__object_info_figure_id())
    if (!ship.valid) {
        return
    }
    ship.set_order(ev.param1)
    ui.window_city_show()
}

[es=(figure_transport_ship_info_window, embark)]
function figure_transport_ship_info_window_on_embark(window) {
    var ship = city.get_transport_ship(__object_info_figure_id())
    if (!ship.valid || !ship.can_embark) {
        return
    }
    __window_city_transport_show(ship.id, TRANSPORT_PICK_FORMATION)
}

[es=(figure_transport_ship_info_window, disembark)]
function figure_transport_ship_info_window_on_disembark(window) {
    var ship = city.get_transport_ship(__object_info_figure_id())
    if (!ship.valid || !ship.has_troops) {
        return
    }
    __window_city_transport_show(ship.id, TRANSPORT_PICK_LANDING)
}

[es=(figure_transport_ship_info_window, show_follow)]
function figure_transport_ship_info_window_on_show_follow(window) {
    __figure_follow_start(__object_info_figure_id())
}

[es=(figure_transport_ship_info_window, window_info_background)]
function figure_transport_ship_info_window_window_info_background(window) {
    var f = city.get_figure(__object_info_figure_id())
    var ship = city.get_transport_ship(f.id)

    window.name.text = f.class_name
    window.hullstrength_lb.text = __loc(184, 2)
    window.hullstrength_val.text = __loc(184, figure_warship_hull_strength_text_id(ship))
    window.onboard.text = figure_transport_ship_onboard_text(ship)

    // Embark and Disembark share a place: the one that fits whether soldiers are on board.
    window.embark.enabled = !ship.has_troops
    window.disembark.enabled = ship.has_troops
    window.embark.darkened = ship.can_embark ? 0 : UiFlags_Grayscale
    window.repair.darkened = ship.damage == 0 ? UiFlags_Grayscale : 0
    var at_wharf = ship.order == TRANSPORT_ORDER_RETURN_TO_WHARF && f.action_state == ACTION_213_TRANSPORT_SHIP_DOCKED
    window.return_to_wharf.darkened = at_wharf ? UiFlags_Grayscale : 0

    var order = ship.order
    for (var i = 0; i < figure_transport_order_buttons.length; i++) {
        var entry = figure_transport_order_buttons[i]
        window[entry.id].selected = entry.order != 0 && order == entry.order
    }

    var action = figure_transport_ship_action_text(window, ship)
    window.action_header.text = action.header
    window.action_text.text = action.text

    var following = __figure_follow_enabled() && __figure_follow_figure_id() == f.id
    window.show_follow.text = following ? "F" : "f"
}
