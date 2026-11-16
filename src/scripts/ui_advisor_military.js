log_info("akhenaten: ui advisor military started")

function get_figure_type_str(figure_type) {
    if (figure_type == FIGURE_INFANTRY)  return __loc(138, 34)
    if (figure_type == FIGURE_FCHARIOTEER) return __loc(138, 33)
    if (figure_type == FIGURE_ARCHER) return __loc(138, 35)
    return ""
}

// "1 Soldier", "6 Soldiers": group 8 holds each noun as a singular, plural pair.
function advisor_military_amount_str(n, singular_id) {
    return n + " " + __loc(8, singular_id + (n == 1 ? 0 : 1))
}

function advisor_military_forts_on_render_item(p) {
    var i = p.user_data
    var form = city.get_battalion_by_index(i)
    if (!form) {
        return
    }
    var x = p.x
    var y = p.y

    ui.button({ text:"", pos:[x + 2, y + 1], size:[px(35) - 4, 40], font:FONT_NORMAL_BLACK_ON_DARK, border:false, body:false })

    var battalion_image = get_image(PACK_GENERAL, 127, form.batalion_id)
    ui.image(battalion_image, {x: x + 6, y: y + 6})
    ui.label(__loc(138, form.batalion_id), vec2i(x + 46, y + 7), FONT_NORMAL_WHITE_ON_DARK)

    var num_figures_str = "" + form.num_figures + " " + get_figure_type_str(form.figure_type)
    ui.label(num_figures_str, vec2i(x + 46, y + 24), FONT_NORMAL_BLACK_ON_DARK)

    var morale_str = __loc(138, 37 + ((form.morale / 5) | 0))
    ui.label_ex(morale_str, vec2i(x + 186, y + 15), FONT_NORMAL_BLACK_ON_DARK, UiFlags_AlignCentered, 0)

    var exp_image = get_image("pharaoh_general/paneling_00537")
    exp_image.tid += ((form.experience / 100) | 0)
    ui.button({ text:"", pos:[x + 276, y + 7], size:[30, 30], font:FONT_NORMAL_BLACK_ON_DARK})
    ui.image(exp_image, { x: x + 279, y: y + 10})

    var goto_legion_image = get_image("pharaoh_general/paneling_00531")
    var goto_clicked = ui.button({text:"", pos:[x + 356, y + 7], size:[30, 30]})
    if (goto_clicked == ui.button_clicked) {
        city.camera_go_to(form.home)
        ui.window_city_show()
    }
    ui.image(goto_legion_image, { x: x + 359, y: y + 10 })

    var fort_image = get_image("pharaoh_general/paneling_00532")
    fort_image.tid += (form.is_at_fort ? 1 : 0)
    var back_to_fort_clicked = ui.button({text:"", pos:[x + 426, y + 7], size:[30, 30], font:FONT_NORMAL_BLACK_ON_DARK})
    if (back_to_fort_clicked == ui.button_clicked) {
        form.return_home()
    }
    ui.image(fort_image, { x: x + 429, y: y + 10 })

    var kingdom_service = get_image("pharaoh_general/paneling_00534")
    kingdom_service.tid += (form.empire_service ? 1 : 0)
    var kingdom_service_clicked = ui.button({text:"", pos:[x + 506, y + 7], size:[30, 30], font:FONT_NORMAL_BLACK_ON_DARK})
    if (kingdom_service_clicked == ui.button_clicked) {
        form.set_empire_service(!form.empire_service)
    }
    ui.image(kingdom_service, vec2i(x + 509, y + 10))
}

// Navy status (Pharaoh's Overseer of the Military: "the navy status report ... each warship crew's fatigue level and
// the hull's strength ... 'Go to Warship' ... 'Return to Wharf'"), texts 51.19-25, ship texts group 184.
var advisor_military_navy = false
var advisor_military_ships = []

function advisor_military_collect_ships() {
    var ships = []
    for (var f = 1; f < 5000; f++) {
        if (!__figure_is_alive(f)) {
            continue
        }
        var t = __figure_get_type(f)
        if (t == FIGURE_WARSHIP || t == FIGURE_TRANSPORT_SHIP) {
            ships.push(f)
        }
    }
    return ships
}

function advisor_military_navy_on_render_item(p) {
    var fid = advisor_military_ships[p.user_data]
    if (!fid || !__figure_is_valid(fid)) {
        return
    }
    var x = p.x
    var y = p.y
    var warship = __figure_get_type(fid) == FIGURE_WARSHIP
    var ship = warship ? city.get_warship(fid) : city.get_transport_ship(fid)

    ui.button({ text:"", pos:[x + 2, y + 1], size:[px(35) - 4, 40], font:FONT_NORMAL_BLACK_ON_DARK, border:false, body:false })
    ui.label(__loc(184, warship ? 1 : 0), vec2i(x + 10, y + 15), FONT_NORMAL_WHITE_ON_DARK)

    if (warship) {
        ui.label_ex(__loc(184, figure_warship_crew_fatigue_text_id(ship)), vec2i(x + 150, y + 15), FONT_NORMAL_BLACK_ON_DARK, UiFlags_AlignCentered, 0)
    }
    ui.label_ex(__loc(184, figure_warship_hull_strength_text_id(ship)), vec2i(x + 258, y + 15), FONT_NORMAL_BLACK_ON_DARK, UiFlags_AlignCentered, 0)

    var goto_image = get_image("pharaoh_general/paneling_00531")
    var goto_clicked = ui.button({text:"", pos:[x + 356, y + 7], size:[30, 30]})
    if (goto_clicked == ui.button_clicked) {
        city.camera_go_to(__figure_get_tile(fid))
        ui.window_city_show()
    }
    ui.image(goto_image, { x: x + 359, y: y + 10 })

    var wharf_image = get_image("pharaoh_general/paneling_00532")
    var return_clicked = ui.button({text:"", pos:[x + 426, y + 7], size:[30, 30], font:FONT_NORMAL_BLACK_ON_DARK})
    if (return_clicked == ui.button_clicked) {
        ship.set_order(warship ? WARSHIP_ORDER_GOTO_WHARF : TRANSPORT_ORDER_RETURN_TO_WHARF)
    }
    ui.image(wharf_image, { x: x + 429, y: y + 10 })
}

function advisor_military_on_render_item(p) {
    if (advisor_military_navy) {
        advisor_military_navy_on_render_item(p)
    } else {
        advisor_military_forts_on_render_item(p)
    }
}

[es=advisor_window]
advisor_military_window {
    advisor: ADVISOR_MILITARY
    allow_rmb_goback : true
    help_id: "message_overseer_military"
    ui : baseui(advisor_window_base, {
        advisor_area            : dummy({ pos [(sw(0) - px(40)) / 2, (sh(0) - px(30)) / 2], size:[px(40), px(27)]
            ui : {
                background   : outer_panel({size[40, 27]})

                title        : text({pos[60, 12], text{group:51, id:0}, font : FONT_LARGE_BLACK_ON_LIGHT })
                advisor_icon : image({pack:PACK_GENERAL, id:128, offset:1, pos[10, 10] })

                h1_1         : text({text{group:51, id:1}, pos[384, 43], font:FONT_SMALL_PLAIN})
                h1_2         : text({text{group:51, id:2}, pos[384, 58], font:FONT_SMALL_PLAIN})
                h2_1         : text({text{group:51, id:3}, pos[454, 43], font:FONT_SMALL_PLAIN})
                h2_2         : text({text{group:51, id:4}, pos[454, 58], font:FONT_SMALL_PLAIN})
                h3_1         : text({text{group:51, id:5}, pos[534, 43], font:FONT_SMALL_PLAIN})
                h3_2         : text({text{group:51, id:6}, pos[534, 58], font:FONT_SMALL_PLAIN})
                h4_morale    : text({text{group:138, id:36}, pos[234, 58], font:FONT_SMALL_PLAIN})
                h5_1         : text({text{group:51, id:17}, pos[304, 43], font:FONT_SMALL_PLAIN})
                h5_2         : text({text{group:51, id:18}, pos[304, 58], font:FONT_SMALL_PLAIN})

                inner_panel  : inner_panel({pos[32, 70], size[36, 12]})

                forts_list   : scrollable_list({
                    pos[38, 76]
                    size[35, 11]
                    view_items: 4
                    buttons_size_y: 44
                    buttons_margin_x: 0
                    buttons_margin_y: 0
                    text_padding_x: 0
                    text_padding_y: 0
                    draw_scrollbar_always: false
                    draw_paneling: false
                    onrender_item: advisor_military_on_render_item
                })

                nothing_text : text({text:"", pos[42, 70 + px(16) / 2], size[px(36), -1], multiline:true, font:FONT_NORMAL_BLACK_ON_LIGHT })
                forts_area   : dummy({ margin{left:30, bottom:-90}
                                        ui {
                                            imgb1       : image({path:"pharaoh_general/paneling_00047", pos[0, 10]})
                                            enemy_text  : text({pos[30, 10], font:FONT_NORMAL_BLACK_ON_LIGHT})

                                            imgb2       : image({path:"pharaoh_general/paneling_00047", pos[0, 30]})
                                            distant_text: text({pos[30, 30], font:FONT_NORMAL_BLACK_ON_LIGHT})

                                            imgb3       : image({path:"pharaoh_general/paneling_00047", pos[0, 50]})
                                            forts_text  : text({pos[30, 50], font:FONT_NORMAL_BLACK_ON_LIGHT})
                                        }
                                    })

                navy_toggle   : button({margin{right:-200, bottom:-46}, size[180, 25], text:"", onclick_event:"toggle_navy"})
                button_help   : help_button({})
            }
        })
    })
}

[es=(advisor_military_window, toggle_navy)]
function advisor_military_window_on_toggle_navy(window) {
    advisor_military_navy = !advisor_military_navy
    advisor_military_window_init(window)
}

function advisor_military_set_headers(window, navy) {
    window.title.text = __loc(51, navy ? 19 : 0)
    window.h1_2.text = __loc(51, navy ? 20 : 2)
    window.h2_2.text = __loc(51, navy ? 21 : 4)
    window.h3_1.enabled = !navy
    window.h3_2.enabled = !navy
    window.h4_morale.text = navy ? __loc(51, 24) : __loc(138, 36)
    window.h4_morale.pos = navy ? [196, 58] : [234, 58]
    window.h5_1.text = __loc(51, navy ? 22 : 17)
    window.h5_2.text = __loc(51, navy ? 23 : 18)
    window.navy_toggle.text = __loc(51, navy ? 0 : 19)
}

[es=(advisor_military_window, init)]
function advisor_military_window_init(window) {
    var enemy_text_id = 8
    if (city.figures.enemies) { enemy_text_id = 10 }
    else if (city.figures.kingdome_soldiers) { enemy_text_id = 11 }

    var distant_battle_text_id = 12
    if (empire.active_battle.egyptian_months_to_travel_back > 0) { distant_battle_text_id = 15 }
    else if (empire.active_battle.egyptian_months_to_travel_forth > 0) { distant_battle_text_id = 14 }
    else if (empire.active_battle.months_until_battle > 0) { distant_battle_text_id = 13 }

    window.enemy_text.text = __loc(51, enemy_text_id)
    window.distant_text.text = __loc(51, distant_battle_text_id)

    var soldiers = city.military.total_soldiers
    var batalions = city.military.total_batalions
    window.forts_text.text = advisor_military_amount_str(soldiers, 46) + " " + __loc(51, 7) + " "
        + advisor_military_amount_str(batalions, 48)

    advisor_military_set_headers(window, advisor_military_navy)
    if (advisor_military_navy) {
        advisor_military_ships = advisor_military_collect_ships()
        var ships = window.forts_list
        ships.clear()
        window.nothing_text.enabled = advisor_military_ships.length == 0
        window.nothing_text.text = __loc(51, 25)
        window.forts_list.enabled = advisor_military_ships.length > 0
        for (var s = 0; s < advisor_military_ships.length; s++) {
            ships.add_item("ship", s)
        }
    } else if (city.num_forts > 0) {
        window.nothing_text.enabled = false
        window.forts_list.enabled = true
        var list = window.forts_list
        list.clear()
        for (var i = 0; i < city.num_forts; i++) {
            list.add_item("fort", i)
        }
    } else {
        window.nothing_text.enabled = true
        window.nothing_text.text = __loc(51, 16)
        window.forts_list.enabled = false
        window.forts_list.clear()
    }

    advisors_toolbar_refresh(window, ADVISOR_MILITARY)
}
