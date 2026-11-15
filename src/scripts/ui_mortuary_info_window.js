log_info("akhenaten: mortuary info window started")

[es=building_info_window]
info_window_mortuary {
    first_advisor    : ADVISOR_HEALTH
    related_buildings [BUILDING_MORTUARY]
    ui : baseui(building_info_window, {
        warning_text    : text({ pos: [20, 46], wrap:px(27), font: FONT_NORMAL_BLACK_ON_LIGHT, multiline:true }),
        resource_icon   : resource_icon({ pos: [32, 100], resource:RESOURCE_LINEN }),
        resource_stored : text({ pos: [60, 104], size: [px(25), 20], font: FONT_NORMAL_BLACK_ON_LIGHT }),
        inner_panel     : inner_panel({ pos: [16, 126], size: [27, 5],
            ui : {
                workers_img  : image({ pack:PACK_GENERAL, id:134, offset:14, pos: [20, 10] }),
                workers_text : text({ pos: [50, 16], text:"${building.num_workers} ${loc.building_employee} ( ${model.laborers}  ${loc.building_employee_needed} )", font: FONT_NORMAL_BLACK_ON_DARK }),
                workers_desc : text({ pos: [50, 16 + 16], font: FONT_NORMAL_BLACK_ON_DARK, multiline:true, wrap:px(24) }),
            }
        }),
    })
}

[es=(info_window_mortuary, init)]
function info_window_mortuary_on_init(window) {
    var b = city.get_building(window.bid)
    var group = b.meta_text_id

    window.warning_text.text = __loc(group, 1)

    var linen = b.stored_resource(RESOURCE_LINEN)
    window.resource_stored.text = linen + __loc(66, linen == 1 ? 123 : 122)

    var reason = { group: group, id: 3 }
    if (b.has_road_access == false) {
        reason = { key: "#building_no_road_access" }
    } else if (b.num_workers <= 0) {
        reason.id = 2
    } else if (!building_mortuary_has_linen_for_work(b)) {
        reason.id = 4
    }
    window.workers_desc.text = __loc(reason)

    building_info_window_setup_advisors(window)
}
