log_info("akhenaten: ui advisor monuments started")

var MONUMENT_PHASE_FINISHED = -1

// Shared state for the burial dispatch amount dialog.
var burial_dispatch_resource = RESOURCE_NONE
var burial_dispatch_amount = 0

// Burial provisions are counted in loads (the scenario's 10 pottery is 1000 in the yards).
var BURIAL_UNITS_PER_LOAD = 100

function burial_loads_in_yards(res) {
    return Math.floor(city_resource_view(res).yards_stored / BURIAL_UNITS_PER_LOAD)
}

function burial_loads_text(res, loads) {
    return String(city_resource_view(res).stack_proper_quantity(loads * BURIAL_UNITS_PER_LOAD))
}

function monuments_advisor_status_line(bid) {
    var monument = city.get_monument(bid)
    if (!monument) {
        return ""
    }
    var phase = monument.phase()
    if (phase === MONUMENT_PHASE_FINISHED) {
        return __loc(5, 32)
    }
    var pct = monument.material_pct_min()
    // phases_total() is vector size / finish threshold; UI shows last schedule index.
    var lastPh = monument.phases_total() - 1
    if (lastPh < 0) {
        lastPh = 0
    }
    return String(phase) + " / " + String(lastPh) + "    " + String(pct) + "%"
}

function monuments_advisor_on_render_item(p) {
    var px = p.x
    var py = p.y
    var bid = p.user_data
    var title = __building_display_name(bid)
    var menu = __building_static_text(monument_weight_btype(bid), "build_menu_text")
    if (menu && menu.length > 0) {
        title = menu
    }
    ui.label(title, [px + 10, py + 7], FONT_NORMAL_WHITE_ON_DARK)
    ui.label(monuments_advisor_status_line(bid), [px + 10, py + 25], FONT_NORMAL_BLACK_ON_DARK)
    if (p.hover) {
        ui.button_border({ x: px + 2, y: py + 2 }, { x: p.sizex - 4, y: p.sizey - 4 }, false)
    }
}

[es=(advisor_monuments_window, click_monument)]
function monuments_advisor_on_click_item(p) {
    var bid = p.user_data
    city.camera_go_to(__building_tile(bid))
    ui.window_city_show()
}

function burial_provisions_on_render_item(p) {
    var px = p.x
    var py = p.y
    var res = p.user_data
    var required = __scenario_burial_provisions_required(res)
    var dispatched = __scenario_burial_provisions_dispatched(res)
    var remaining = __scenario_burial_provisions_remaining(res)
    var rv = city_resource_view(res)
    var in_yards = burial_loads_in_yards(res)

    ui.resource_icon([px + 7, py + 7], res)
    ui.label(burial_loads_text(res, dispatched) + " / " + burial_loads_text(res, required) + " " + __loc(23, res),
             [px + 30, py + 7], FONT_NORMAL_WHITE_ON_DARK)
    ui.label(String(rv.stack_proper_quantity(rv.yards_stored)) + " " + __loc(199, 1),
             [px + 30, py + 25], FONT_NORMAL_WHITE_ON_DARK)

    var status
    var status_font = FONT_NORMAL_WHITE_ON_DARK
    if (remaining <= 0) {
        status = __loc(199, 2) // Finished
        status_font = FONT_NORMAL_YELLOW
    } else if (in_yards <= 0) {
        status = __loc("#ui_unable_to_fulfill_request")
    } else {
        status = __loc(52, 47) // can fulfill / ready
        status_font = FONT_NORMAL_YELLOW
    }
    ui.label(status, [px + 280, py + 25], status_font)

    if (p.hover && remaining > 0) {
        ui.button_border({ x: px + 2, y: py + 2 }, { x: p.sizex - 4, y: p.sizey - 4 }, false)
    }
}

[es=(advisor_monuments_window, click_burial)]
function burial_provisions_on_click_item(p) {
    var res = p.user_data
    var remaining = __scenario_burial_provisions_remaining(res)
    if (remaining <= 0) {
        ui.show_ok(__loc(5, 33), __loc(5, 32))
        return
    }
    var stored = burial_loads_in_yards(res)
    if (stored <= 0) {
        ui.show_ok(__loc(5, 31), __loc(5, 30))
        return
    }
    burial_dispatch_resource = res
    burial_dispatch_amount = Math.min(remaining, stored)
    window_show_by_id("burial_dispatch_window")
}

function burial_dispatch_max_allowed() {
    var remaining = __scenario_burial_provisions_remaining(burial_dispatch_resource)
    return Math.min(remaining, burial_loads_in_yards(burial_dispatch_resource))
}

function burial_dispatch_clamp_amount() {
    var max = burial_dispatch_max_allowed()
    if (burial_dispatch_amount > max) {
        burial_dispatch_amount = max
    }
    if (burial_dispatch_amount < 0) {
        burial_dispatch_amount = 0
    }
}

function burial_dispatch_set_all() {
    burial_dispatch_amount = burial_dispatch_max_allowed()
}

function burial_dispatch_do_dispatch() {
    burial_dispatch_clamp_amount()
    if (burial_dispatch_amount <= 0) {
        ui.show_ok(__loc(5, 31), __loc(5, 30))
        return
    }
    var result = __scenario_burial_provisions_dispatch(burial_dispatch_resource, burial_dispatch_amount)
    if (result === -1) {
        ui.show_ok(__loc(5, 31), __loc(5, 30))
        return
    }
    if (result === -2) {
        ui.show_ok(__loc(5, 33), __loc(5, 32))
        return
    }
    if (result <= 0) {
        return
    }
    window_advisors_show()
}

function burial_dispatch_cancel() {
    window_advisors_show()
}

function burial_dispatch_amount_text() {
    if (burial_dispatch_resource === RESOURCE_NONE) {
        return "0"
    }
    return burial_loads_text(burial_dispatch_resource, burial_dispatch_amount) + " " + __loc(23, burial_dispatch_resource)
}

[es=advisor_window]
advisor_monuments_window {
    advisor: ADVISOR_MONUMENTS
    allow_rmb_goback : true
    help_id: "message_overseer_monuments"
    ui : baseui(advisor_window_base, {
        advisor_area             : dummy({ pos [(sw(0) - px(40)) / 2, (sh(0) - px(30)) / 2], size:[px(40), px(27)]
			ui : {
                background    : outer_panel({size[40, 27]})
                advisor_icon  : image({pack:PACK_GENERAL, id:128, offset:12, pos[10, 10] })
                title         : text({pos[60, 12], text{group:4, id:13}, font:FONT_LARGE_BLACK_ON_LIGHT })
                rating_line   : label({pos[60, 42], text:"", font:FONT_NORMAL_BLACK_ON_LIGHT})

                monuments_panel : inner_panel({pos[32, 60], size[36, 8]})
                monuments_list : scrollable_list({
                    pos[38, 66]
                    size[33, 7]
                    view_items: 3
                    buttons_size_y: 40
                    buttons_margin_x: 0
                    buttons_margin_y: 0
                    text_padding_x: 0
                    text_padding_y: 0
                    draw_scrollbar_always: false
                    draw_paneling: false
                    onrender_item: monuments_advisor_on_render_item
                    onclick_event: "click_monument"
                })
                no_monuments : label({pos[120, 110], text:"${53.69}", font:FONT_NORMAL_WHITE_ON_DARK })

                burial_title  : text({pos[60, 200], text{group:199, id:10}, font:FONT_NORMAL_BLACK_ON_LIGHT })
                burial_hint   : text({pos[60, 218], text{group:199, id:3}, font:FONT_NORMAL_BLACK_ON_LIGHT })
                burial_panel  : inner_panel({pos[32, 238], size[36, 8]})
                burial_list : scrollable_list({
                    pos[38, 244]
                    size[33, 7]
                    view_items: 3
                    buttons_size_y: 40
                    buttons_margin_x: 0
                    buttons_margin_y: 0
                    text_padding_x: 0
                    text_padding_y: 0
                    draw_scrollbar_always: false
                    draw_paneling: false
                    onrender_item: burial_provisions_on_render_item
                    onclick_event: "click_burial"
                })
                no_burial : label({pos[100, 280], text:"${199.12}", font:FONT_NORMAL_WHITE_ON_DARK })

                button_help   : help_button({})
            }
        })
    })
}

[es=(advisor_monuments_window, init)]
function advisor_monuments_window_init(window) {
    var rating_txt = __loc("#mission_won_monument_rating") + " " + city.rating.monument
    if (!__scenario_burial_provisions_complete()) {
        rating_txt = rating_txt + "  (" + __loc(199, 10) + ")"
    }
    window.rating_line.text = rating_txt
    advisors_toolbar_refresh(window, ADVISOR_MONUMENTS)
}

[es=(advisor_monuments_window, ui_draw_foreground)]
function advisor_monuments_window_draw(window) {
    var n = __city_monuments_list_refresh()
    window.no_monuments.enabled = (n <= 0)

    var list = window.monuments_list
    if (list.items_count !== n) {
        list.clear()
        for (var i = 0; i < n; i++) {
            list.add_item("monument", __city_monuments_list_id_at(i))
        }
    }

    var bn = __scenario_burial_provisions_count()
    window.no_burial.enabled = (bn <= 0)
    window.burial_hint.enabled = (bn > 0)

    var blist = window.burial_list
    // Rebuild when count changes or when any remaining/dispatched may have changed —
    // always refresh labels via onrender; only rebuild items if count differs.
    if (blist.items_count !== bn) {
        blist.clear()
        for (var j = 0; j < bn; j++) {
            blist.add_item("burial", __scenario_burial_provisions_resource_at(j))
        }
    }
}

[es=modal_window]
burial_dispatch_window {
    pos [(sw(0) - px(28)) / 2, (sh(0) - px(12)) / 2]
    allow_rmb_goback : true
    draw_underlying : true
    // A relayout re-runs this file and resets the chosen provision and amount; wait until the window closes.
    defer_relayout : true

    ui {
        background_image : background({pack:PACK_UNLOADED, id:11})
        background       : outer_panel({size[28, 12]})
        title            : text_center({pos[16, 16], size[px(28) - 32, 20], text[199, 4], font: FONT_LARGE_BLACK_ON_LIGHT})

        amounts_panel    : inner_panel({pos[32, 56], size[24, 4]
            ui {
                resource_icon : resource_icon({pos[16, 20], resource:RESOURCE_NONE})
                amount_value  : label({pos[48, 24], font: FONT_NORMAL_WHITE_ON_DARK, textfn: burial_dispatch_amount_text})
                arrow_down    : arrowdown({pos[176, 18], tiny: false, allow_repeat: true })
                arrow_up      : arrowup({pos[200, 18], tiny: false, allow_repeat: true })
                btn_all       : button({pos[280, 18], size[80, 24], text[199, 5], font: FONT_NORMAL_WHITE_ON_DARK})
            }
        })

        btn_dispatch     : button({pos[48, 140], size[160, 24], text[199, 6], font: FONT_NORMAL_BLACK_ON_LIGHT})
        btn_cancel       : button({pos[240, 140], size[160, 24], text[199, 7], font: FONT_NORMAL_BLACK_ON_LIGHT})
    }
}

[es=(burial_dispatch_window, btn_all)]
function burial_dispatch_window_btn_all(window) {
    burial_dispatch_set_all()
}

[es=(burial_dispatch_window, btn_dispatch)]
function burial_dispatch_window_btn_dispatch(window) {
    burial_dispatch_do_dispatch()
}

[es=(burial_dispatch_window, btn_cancel)]
function burial_dispatch_window_btn_cancel(window) {
    burial_dispatch_cancel()
}

[es=(burial_dispatch_window, arrow_down)]
function burial_dispatch_window_arrow_down(window) {
    burial_dispatch_amount -= 1
    burial_dispatch_clamp_amount()
}

[es=(burial_dispatch_window, arrow_up)]
function burial_dispatch_window_arrow_up(window) {
    burial_dispatch_amount += 1
    burial_dispatch_clamp_amount()
}

[es=(burial_dispatch_window, init)]
function burial_dispatch_window_init(window) {
    burial_dispatch_clamp_amount()
    window.resource_icon.image = burial_dispatch_resource
}
