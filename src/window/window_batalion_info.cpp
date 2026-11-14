#include "window_batalion_info.h"

#include "figure/formation.h"
#include "city/object_info.h"
#include "graphics/graphics.h"
#include "window/building/common.h"
#include "graphics/image.h"
#include "game/game.h"
#include "core/log.h"
#include "figure/figure.h"
#include "grid/building.h"
#include "graphics/window.h"
#include "figure/formation_batalion.h"
#include "window/window_city.h"
#include "window/window_city_military.h"
#include "graphics/view/view.h"
#include "sound/sound.h"
#include "core/calc.h"

batalion_info_window batalion_infow;

batalion_info_window::batalion_info_window() {
    window_batalion_register_handler(this);
}

static pcstr buttons[] = {"formation_1", "formation_2", "formation_3", "formation_4"};

namespace {
    enum e_company_order { ORDER_NONE = -1, ORDER_TIGHT, ORDER_LOOSE, ORDER_ENGAGE, ORDER_MOP_UP, ORDER_CHARGE };

    // Pharaoh's orders (help message 87) and their title in text group 138; the description follows it.
    // Engage nearby is layout 0x0F: the company holds and fights whatever comes within a few tiles.
    struct company_order_t {
        e_formation_layout layout;
        int title_id;
    };

    const company_order_t COMPANY_ORDERS[] = {
      {FORMATION_DOUBLE_LINE_1, 12},
      {FORMATION_SINGLE_LINE_1, 14},
      {FORMATION_CHARGE, 16},
      {FORMATION_MOP_UP, 18},
      {FORMATION_COLUMN, 20},
    };

    // Pharaoh_Unloaded group 34 holds each type's four order pictures, then Return to Fort and its
    // greyed copy. Charioteers have Charge where the others have loose formation.
    int company_image_base(e_figure_type type) {
        if (type == FIGURE_ARCHER) {
            return 6;
        }
        if (type == FIGURE_FCHARIOTEER) {
            return 12;
        }
        return 0;
    }

    std::array<e_company_order, 4> company_order_slots(e_figure_type type) {
        if (type == FIGURE_FCHARIOTEER) {
            return {ORDER_TIGHT, ORDER_CHARGE, ORDER_ENGAGE, ORDER_MOP_UP};
        }
        return {ORDER_TIGHT, ORDER_LOOSE, ORDER_ENGAGE, ORDER_MOP_UP};
    }

    e_company_order company_order_of(const formation& m) {
        switch (m.layout) {
        case FORMATION_DOUBLE_LINE_1:
        case FORMATION_DOUBLE_LINE_2:
            return ORDER_TIGHT;
        case FORMATION_SINGLE_LINE_1:
        case FORMATION_SINGLE_LINE_2:
            return ORDER_LOOSE;
        case FORMATION_CHARGE:
            return ORDER_ENGAGE;
        case FORMATION_MOP_UP:
            return ORDER_MOP_UP;
        case FORMATION_COLUMN:
            return m.figure_type == FIGURE_FCHARIOTEER ? ORDER_CHARGE : ORDER_NONE;
        default:
            return ORDER_NONE;
        }
    }
} // namespace

struct military_data_t {
    object_info* context_for_callback;
};

military_data_t g_military_data;

//void window_info_legion_button_priority(int index, int param2) {
//    auto& data = g_military_data;
//    building* barracks = building_get(data.building_id);
//    //if (index != barracks->subtype.barracks_priority)
//    //    barracks->barracks_toggle_priority();
//}

//int window_building_handle_mouse_legion_info(const mouse* m, object_info &c) {
//    auto& data = g_military_data;
//    data.context_for_callback = &c;
//    int button_id = generic_buttons_handle_mouse(m, c.offset, layout_buttons, 5, &data.focus_button_id);
//    if (formation_get(c.formation_id)->figure_type == FIGURE_INFANTRY) {
//        if (data.focus_button_id == 1 || (data.focus_button_id == 2 && c.formation_types == 3))
//            data.focus_button_id = 0;
//    }
//    if (!button_id) {
//        button_id = generic_buttons_handle_mouse(m, {c.offset.x + 16 * (c.bgsize.x - 18) / 2, c.offset.y + 16 * c.bgsize.y - 48}, return_button, 1, &data.return_button_id);
//    }
//    data.context_for_callback = 0;
//    return button_id;
//}

//int legion_info_window::window_info_handle_mouse(const mouse *m, object_info &c) {
//    return window_building_handle_mouse_legion_info(m, &c);
//}

//void draw_priority_buttons(int x, int y, int buttons) {
//    auto& data = g_military_data;
//    uint8_t permission_selection_text[] = {'x', 0};
//    for (int i = 0; i < buttons; i++) {
//        int x_adj = x + priority_buttons[i].x;
//        int y_adj = y + priority_buttons[i].y;
//        building* barracks = building_get(data.building_id);
//        //int priority = barracks->barracks_get_priority();
//        //button_border_draw(x_adj, y_adj, 20, 20, data.focus_priority_button_id == i + 1 ? 1 : 0);
//        //if (priority == i) {
//        //    text_draw_centered(permission_selection_text, x_adj + 1, y_adj + 4, 20, FONT_NORMAL_BLACK_ON_LIGHT, 0);
//        //}
//    }
//}

void batalion_info_window::change_layout(e_formation_layout new_layout) {
    auto& data = g_military_data;
    building* b = data.context_for_callback->building_get();

    formation* m = formation_get(b->formation_id);
    if (m->in_distant_battle)
        return;

    formation_batalion_change_layout(m, formation_batalion_line_layout(new_layout, m->direction));
    switch (new_layout) {
    case 0:
        g_sound.speech_play_file("Wavs/f_infantry.wav", 255);
        break;
    case 1:
        g_sound.speech_play_file("Wavs/F_ARCHER.WAV", 255);
        break;
    case 2:
        g_sound.speech_play_file("Wavs/f_chariot.wav", 255);
        break;
    case 3:
        g_sound.speech_play_file("Wavs/BARRACK.WAV", 255);
        break;
    case 4:
        g_sound.speech_play_file("Wavs/WEAPON.WAV", 255);
        break;
    }
    window_city_military_show(b->formation_id);
    update_layout();
}

void batalion_info_window::window_info_foreground(object_info &c) {
    building_info_window::window_info_foreground(c);
}

void batalion_info_window::update_layout() {
    auto &data = g_military_data;
    building *fort = data.context_for_callback->building_get();
    const formation *m = formation_get(fort->formation_id);

    const int image_base = company_image_base(m->figure_type);
    const auto slots = company_order_slots(m->figure_type);
    const e_company_order current = company_order_of(*m);
    const bool can_order = m->num_figures > 0 && !m->cursed_by_seth;
    for (int i = 0; i < std::size(buttons); ++i) {
        auto imgbtn = ui[buttons[i]].dcast_image_button();
        imgbtn->param1 = COMPANY_ORDERS[slots[i]].layout;
        imgbtn->image(image_base + i);
        imgbtn->darkened = can_order ? UiFlags_None : UiFlags_Grayscale;
        imgbtn->select(can_order && slots[i] == current);
        imgbtn->onclick([this] (int p1, int) {
            this->change_layout((e_formation_layout)p1);
            this->update_describe_layout(*g_military_data.context_for_callback);
        });
    }

    auto return_btn = ui["return_to_fort"].dcast_image_button();
    return_btn->image(image_base + (m->is_at_fort ? 5 : 4));
    return_btn->darkened = m->is_at_fort ? UiFlags_Grayscale : UiFlags_None;
}

// The company's name, standard, soldiers, health, experience and morale come from the fort
// window's script (batalion_info_window init); this sets up the orders.
void batalion_info_window::init(object_info &c) {
    building_info_window::init(c);

    g_military_data.context_for_callback = &c;
    update_layout();

    ui["return_to_fort"].onclick([] {
        auto &data = g_military_data;
        building* b = data.context_for_callback->building_get();
        formation *m = formation_get(b->formation_id);
        if (!m->in_distant_battle && m->is_at_fort != 1) {
            formation_batalion_return_home(m);
            window_city_show();
        }
    });
}

void batalion_info_window::window_info_background(object_info &c) {
    building_info_window::window_info_background(c);

    update_describe_layout(c);
}

//int window_building_get_legion_info_tooltip_text(object_info* c) {
//    auto& data = g_military_data;
//    return data.focus_button_id ? 147 : 0;
//}

//textid legion_info_window::get_tooltip(object_info &c) {
//    return textid{0xffff, (uint8_t)window_building_get_legion_info_tooltip_text(&c)};
//}

bool batalion_info_window::check(object_info &c) {
    // Fort buildings use info_window_fort. Company orders open when the player
    // right-clicks the standard bearer or any soldier in an own battalion
    // (same routing as Julius BUILDING_INFO_LEGION), or taps a fort on a touch screen,
    // which has no right-click.
    if (c.company_orders) {
        building* fort = c.building_get();
        const formation* m
          = (fort && fort->is_valid() && fort->is_fort()) ? formation_get(fort->formation_id) : nullptr;
        return m && m->in_use && m->own_batalion;
    }

    if (c.figure_ids.empty()) {
        return false;
    }

    figure *f = c.figure_get();
    if (!f || f->formation_id <= 0) {
        return false;
    }

    const formation *m = formation_get(f->formation_id);
    if (!m || !m->in_use || !m->own_batalion) {
        return false;
    }

    if (m->building_id) {
        c.bid = m->building_id;
    }
    return true;
}

void batalion_info_window::update_describe_layout(object_info &c) {
    const formation* m = formation_get(c.building_get()->formation_id);

    if (m->cursed_by_seth) {
        ui["layout_header"] = ui::str(138, 59);
        ui["layout_desc"] = ui::str(89, 1);
        return;
    }

    if (!m->num_figures) {
        ui["layout_header"] = "";
        ui["layout_desc"] = ui::str(138, g_city.buildings.count_active(BUILDING_RECRUITER) ? 10 : 11);
        return;
    }

    const e_company_order order = company_order_of(*m);
    if (order == ORDER_NONE) {
        ui["layout_header"] = "";
        ui["layout_desc"] = "";
        return;
    }

    const int title_id = COMPANY_ORDERS[order].title_id;
    ui["layout_header"] = ui::str(138, title_id);
    ui["layout_desc"] = ui::str(138, title_id + 1);
}
