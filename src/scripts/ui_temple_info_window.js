log_info("akhenaten: temple info window started")

temple_info_window {
    ui {
        background   : outer_panel({  size [29, 18]})
        title        : text({ pos[0, 16], size[px(29), 13], text:"${building.name}", font : FONT_LARGE_BLACK_ON_LIGHT, align:"center"})

        inner_panel  : inner_panel({ pos[16, 56], size[27, 4] })
        workers_img  : image({ pack:PACK_GENERAL, id:134, offset:14, pos[40, 70] })
        workers_text : text({ text:"${building.num_workers} ${loc.building_employee} ( ${model.laborers} ${loc.building_employee_needed} )", pos[70, 74], font: FONT_NORMAL_BLACK_ON_DARK, multiline:true, wrap:px(24) })
        workers_desc : text({ pos[70, 74 + 16], font: FONT_NORMAL_BLACK_ON_DARK })
        button_help  : help_button({})
        button_close : close_button({})
        show_overlay : button({
            margin:{right:-64, bottom:-40}, size:[23, 23]
            textfn: building_info_window_text_overlay
        })
        god_image    : image({ pos[190, 134] })
        mothball     : button({
                               margin:{right:-90, bottom:-40}, size[23, 23]
                               textfn:building_info_window_text_mothball
                              })
    }
}

[es=building_info_window]
info_window_temple_complex {
    related_buildings [BUILDING_TEMPLE_COMPLEX_OSIRIS, BUILDING_TEMPLE_COMPLEX_RA, BUILDING_TEMPLE_COMPLEX_PTAH, BUILDING_TEMPLE_COMPLEX_SETH, BUILDING_TEMPLE_COMPLEX_BAST]
    ui {
        background   : outer_panel({ size: [29, 26]})
        title        : text({ pos[0, 16], size[px(29), 13], font : FONT_LARGE_BLACK_ON_LIGHT, align:"center"})

        inner_panel  : inner_panel({ pos[16, 56], size[27, 4] })
        workers_img  : image({ pack:PACK_GENERAL, id:134, offset:14, pos[40, 70] })
        workers_text : text({ text:"${building.num_workers} ${loc.building_employee} ( ${model.laborers}  ${loc.building_employee_needed} )", pos[70, 74], font: FONT_NORMAL_BLACK_ON_DARK, multiline:true, wrap:px(24) })
        workers_desc : text({ pos[70, 74 + 16], font: FONT_NORMAL_BLACK_ON_DARK })
        altar_text   : text({ pos[32, 132], font: FONT_NORMAL_BLACK_ON_LIGHT })
        oracle_text  : text({ pos[32, 150], font: FONT_NORMAL_BLACK_ON_LIGHT })
        description  : text({ pos[32, 176], font: FONT_NORMAL_BLACK_ON_LIGHT, multiline:true, wrap:px(26) })
        button_help  : help_button({})
        button_close : close_button({})
        show_overlay : button({
            margin{right:-64, bottom:-40}, size[23, 23]
            textfn: building_info_window_text_overlay
        })
        mothball     : button({
                                margin{right:-90, bottom:-40}, size[23, 23]
                                textfn:building_info_window_text_mothball
                              })
    }
}

[es=building_info_window]
info_window_temple {
    related_buildings [BUILDING_TEMPLE_OSIRIS, BUILDING_TEMPLE_RA, BUILDING_TEMPLE_PTAH, BUILDING_TEMPLE_SETH, BUILDING_TEMPLE_BAST]
    ui : baseui(temple_info_window, {
    })
}





function info_window_temple_common_init(window) {
    var b = city.get_building(window.bid)
    var image_offset = 0

    switch (b.type) {
    case BUILDING_TEMPLE_OSIRIS: image_offset = 21; break
    case BUILDING_TEMPLE_RA: image_offset = 22; break
    case BUILDING_TEMPLE_PTAH: image_offset = 23; break
    case BUILDING_TEMPLE_SETH: image_offset = 24; break
    case BUILDING_TEMPLE_BAST: image_offset = 25; break
    default:
        return
    }

    var img_id = get_image({ pack: PACK_UNLOADED, id: 21, offset: image_offset })
    if (!img_id) {
        return
    }

    window.god_image.image = img_id.tid
}

[es=(info_window_temple, init)]
function info_window_temple_on_init(window) {
    info_window_temple_common_init(window)
}

// The complex's add-ons (group 189: altar, oracle per god) and its god's description (59.32-36), which explains
// them. Tapping the altar or oracle opens this window too (window_info.cpp).
[es=(info_window_temple_complex, init)]
function info_window_temple_complex_on_init(window) {
    var b = city.get_building(window.bid)
    var god = b.type - BUILDING_TEMPLE_COMPLEX_OSIRIS
    if (god < 0 || god > 4) {
        return
    }
    // The base window fills an empty title only, so it kept the first complex's name after another one opened.
    window.title.text = __loc(28, b.type)
    var complex = city.get_temple_complex(b.type)
    var has_altar = complex && complex.has_upgrade(TEMPLE_COMPLEX_UPGRADE_ALTAR)
    var has_oracle = complex && complex.has_upgrade(TEMPLE_COMPLEX_UPGRADE_ORACLE)
    window.altar_text.text = __loc(189, god * 2) + ": " + __loc(has_altar ? "#temple_complex_addon_built" : "#temple_complex_addon_not_built")
    window.oracle_text.text = __loc(189, god * 2 + 1) + ": " + __loc(has_oracle ? "#temple_complex_addon_built" : "#temple_complex_addon_not_built")
    window.description.text = __loc(59, 32 + god)
}