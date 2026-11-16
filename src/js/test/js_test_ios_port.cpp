#include "js/test/js_test_common.h"

// Test hooks added on the ios-port branch (moved here when upstream split js_test_game.cpp by domain).

#include "figure/formation_batalion.h"
#include "building/building_statue.h"
#include "graphics/window.h"
#include "graphics/elements/rich_text.h"
#include "graphics/elements/ui.h"
#include "platform/renderer.h"
#include "building/construction/build_planner.h"
#include "building/building_fort.h"
#include "building/building_barracks.h"
#include "building/building_gatehouse.h"
#include "js/js_game.h"
#include "core/app.h"
#include "core/log.h"
#include "js/js.h"
#include "js/js_defines.h"
#include "mujs/mujs.h"
#include "platform/arguments.h"
#include "platform/integral_tests.h"
#include "widget/debug_console.h"
#include "building/building.h"
#include "building/building_delivery_path.h"
#include "building/building_house.h"
#include "building/building_bazaar.h"
#include "building/building_granary.h"
#include "building/building_mansion.h"
#include "building/building_food_mill.h"
#include "building/building_static_params.h"
#include "building/building_storage.h"
#include "building/building_storage_yard.h"
#include "building/building_temple_complex.h"
#include "building/building_shipyard.h"
#include "building/building_fishing_wharf.h"
#include "building/monument_mastaba.h"
#include "building/monument_pyramid.h"
#include "building/monument_mastaba_engine.h"
#include "building/monument_pyramid_engine.h"
#include "building/monument_pyramid_ramp.h"
#include "building/monument_pyramid_figure.h"
#include "building/monument_royal_tomb.h"
#include "building/monument_obelisk.h"
#include "figuretype/figure_bricklayer.h"
#include "figuretype/figure_carpenter.h"
#include "figuretype/figure_worker.h"
#include "building/building_road.h"
#include "building/monuments.h"
#include "grid/desirability.h"
#include "grid/property.h"
#include "grid/image.h"
#include "building/construction_blessing.h"
#include "city/city_recorded_paths.h"
#include "grid/grid.h"
#include "grid/terrain.h"
#include "grid/water.h"
#include "grid/building.h"
#include "grid/building_tiles.h"
#include "grid/gems.h"
#include "grid/golden.h"
#include "grid/malaria_risk.h"
#include "city/city_malaria_risk.h"
#include "grid/granite.h"
#include "grid/limestone.h"
#include "grid/sandstone.h"
#include "grid/stone.h"
#include "graphics/view/view.h"
#include "graphics/view/zoom.h"
#include "graphics/image.h"
#include "figure/figure.h"
#include "figure/figure_impl.h"
#include "figuretype/figure_market_buyer.h"
#include "figuretype/figure_cartpusher.h"
#include "figuretype/figure_ferry_boat.h"
#include "figuretype/figure_flotsam.h"
#include "figuretype/figure_docker.h"
#include "figuretype/figure_immigrant.h"
#include "game/game_config.h"
#include "game/game_events.h"
#include "figuretype/figure_missile.h"
#include "figuretype/figure_javelin.h"
#include "figuretype/figure_hunter.h"
#include "figuretype/figure_stonemason.h"
#include "figuretype/figure_tomb_artisan.h"
#include "figuretype/animal_lion.h"
#include "figuretype/animal_asp.h"
#include "figuretype/animal_scorpion.h"
#include "figuretype/figure_mummy.h"
#include "figuretype/figure_plagued_citizen.h"
#include "figuretype/figure_locust.h"
#include "figuretype/figure_frog.h"
#include "figuretype/figure_funeral_walker.h"
#include "figuretype/figure_tomb_robber.h"
#include "figuretype/figure_constable.h"
#include "figuretype/figure_enemy_transport.h"
#include "figuretype/figure_enemy_warship.h"
#include "figuretype/figure_enemy_elephant.h"
#include "figuretype/figure_enemy_spearman.h"
#include "figuretype/figure_enemy_archer.h"
#include "figuretype/figure_transport_ship.h"
#include "figuretype/figure_war_ship.h"
#include "figuretype/figure_soldier.h"
#include "building/building_transport_wharf.h"
#include "building/building_warship_wharf.h"
#include "figure/combat.h"
#include "city/city_animals.h"
#include "graphics/color.h"
#include "city/city.h"
#include "sound/sound.h"
#include "window/numeric_input.h"
#include "city/city_message.h"
#include "city/city_industry.h"
#include "city/city_buildings.h"
#include "city/city_maintenance.h"
#include "city/city_religion_seth.h"
#include "grid/road_access.h"
#include "city/city_warnings.h"
#include "city/legion_requests.h"
#include "core/xstring.h"
#include "grid/road_network.h"
#include "grid/tiles.h"
#include "grid/vegetation.h"
#include "grid/routing/routing_terrain.h"
#include "grid/routing/routing.h"
#include "figure/route.h"
#include <array>
#include "game/autosave_module.h"
#include "core/bstring.h"
#include "game/player_profile.h"
#include "window/autoconfig_window.h"
#include "game/game.h"
#include "game/file_editor.h"
#include "game/resource.h"
#include "content/vfs.h"
#include "editor/editor.h"
#include "io/gamestate/boilerplate.h"
#include "input/scroll.h"
#include "input/hotkey.h"
#include "scenario/editor.h"
#include "scenario/editor_map_meta.h"
#include "scenario/scenario.h"
#include "scenario/scenario_event_manager.h"
#include "scenario/scenario_invasion.h"
#include "scenario/types.h"
#include "window/window_info.h"
#include "window/window_city.h"
#include "window/message_dialog_new.h"
#include "city/object_info.h"
#include "scenario/request.h"
#include "scenario/distant_battle.h"
#include "figure/enemy_army.h"
#include "figure/formation.h"
#include "empire/empire.h"
#include "widget/widget_sidebar.h"
#include "graphics/screen.h"
#include <SDL.h>
#include <algorithm>
#include <vector>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <string>
#include "figuretype/figure_kingdome_trader.h"
#include "figuretype/figure_trader_ship.h"
#include "empire/trader_handler.h"
#include "empire/empire_traders.h"


static void push_finger(Uint32 type, int finger, int x, int y) {
    SDL_Event e{};
    e.type = type;
    e.tfinger.touchId = 0x7e57; // not the macOS trackpad, which platform_touch_start ignores
    e.tfinger.fingerId = finger;
    e.tfinger.x = (float)x / (float)screen_width();
    e.tfinger.y = (float)y / (float)screen_height();
    e.tfinger.pressure = 1.0f;
    SDL_PushEvent(&e);
}

void __test_touch_down(int finger, int x, int y) {
    push_finger(SDL_FINGERDOWN, finger, x, y);
}
ANK_FUNCTION_3(__test_touch_down);

void __test_touch_move(int finger, int x, int y) {
    push_finger(SDL_FINGERMOTION, finger, x, y);
}
ANK_FUNCTION_3(__test_touch_move);

void __test_touch_up(int finger, int x, int y) {
    push_finger(SDL_FINGERUP, finger, x, y);
}
ANK_FUNCTION_3(__test_touch_up);

// Integral tests start with scrolling off; a test measuring drags turns it on.
static void __test_scroll_set_input(bool enabled) {
    g_scroll.set_mouse_input(enabled);
}
ANK_FUNCTION_1(__test_scroll_set_input);

static void __test_player_set_record_score(int scenario_id, int score) {
    g_player.records[scenario_id].score = (uint32_t)score;
    g_player.save();
}
ANK_FUNCTION_2(__test_player_set_record_score);

static vec2i __test_window_pos(xstring section) {
    autoconfig_window* w = autoconfig_window::find(section);
    return w ? w->pos : vec2i{-1, -1};
}
ANK_FUNCTION_1(__test_window_pos);

// The open building/figure info panel's section ("info_window_fort", "batalion_info_window"), or "".
static xstring __test_info_window_section() {
    const object_info& c = common_info_window::get_object_info();
    return c.ui ? c.ui->get_section() : xstring();
}
ANK_FUNCTION(__test_info_window_section);

extern build_planner::ghost_fade_stats g_ghost_fade_stats;
// "drawn,faded,kept" for the last building preview.
static xstring __test_ghost_fade_stats() {
    char out[64];
    snprintf(out, sizeof(out), "%d,%d,%d", g_ghost_fade_stats.drawn, g_ghost_fade_stats.faded, g_ghost_fade_stats.kept);
    return xstring(out);
}
ANK_FUNCTION(__test_ghost_fade_stats);

static void __test_god_set_state(int god, int mood, int months_since_festival) {
    if (god < 0 || god >= MAX_GODS) {
        return;
    }
    god_state& g = g_city.religion.gods[god];
    g.mood = (uint8_t)mood;
    g.target_mood = (uint8_t)mood;
    g.happy_ankhs = 0;
    g.wrath_bolts = 0;
    g.months_since_festival = (uint8_t)months_since_festival;
}
ANK_FUNCTION_3(__test_god_set_state);

// One day's mood update with `god` as the day's randomly picked god.
static void __test_religion_update_mood(int god) {
    g_city.religion.update_mood((e_god)god);
}
ANK_FUNCTION_1(__test_religion_update_mood);

// The month-start blessing/curse check with `god` as the month's picked god.
static void __test_religion_monthly_blessings(int god) {
    g_city.religion.update_curses_and_blessings((e_god)god, GED_EVENT_UNKNOWN);
}
ANK_FUNCTION_1(__test_religion_monthly_blessings);

// Sound effects the game asked for since the last call, as "4,42"; clears the list.
static xstring __test_sound_effects_requested() {
    char out[512] = "";
    int len = 0;
    for (int i = 0; i < g_sound.requested_effects_count && len < (int)sizeof(out) - 8; i++) {
        len += snprintf(out + len, sizeof(out) - len, i ? ",%d" : "%d", g_sound.requested_effects[i]);
    }
    g_sound.requested_effects_count = 0;
    return xstring(out);
}
ANK_FUNCTION(__test_sound_effects_requested);

// How a building is destroyed: "fire", "collapse" or "enemy".

static void __test_numeric_input_show(int x, int y) {
    window_numeric_input_show(x, y, 3, 999, [](int) {});
}
ANK_FUNCTION_2(__test_numeric_input_show);

static int __test_numeric_input_value() {
    return window_numeric_input_value();
}
ANK_FUNCTION(__test_numeric_input_value);

// RGB of a canvas pixel in the last drawn frame, or -1 if it can't be read.
static int __test_screen_pixel(int x, int y) {
    painter ctx = game.painter();
    color c = 0;
    if (!g_render.save_screen_buffer(ctx, &c, x, y, 1, 1, 1)) {
        return -1;
    }
    return (int)(c & 0xffffff);
}
ANK_FUNCTION_2(__test_screen_pixel);

static bool __test_sound_ready() {
    return g_sound.is_initialized();
}
ANK_FUNCTION(__test_sound_ready);

// Channel file names are empty under --nosound or --no-resource; a channel loads its file on first play.
static xstring __test_sound_channel_file(int channel) {
    auto channels = g_sound.channels();
    return (channel >= 0 && channel < (int)channels.size()) ? xstring(channels[channel].filename.c_str()) : xstring();
}
ANK_FUNCTION_1(__test_sound_channel_file);

static bool __test_sound_channel_loaded(int channel) {
    auto channels = g_sound.channels();
    return channel >= 0 && channel < (int)channels.size() && channels[channel].chunk != nullptr;
}
ANK_FUNCTION_1(__test_sound_channel_loaded);

static vec2i __test_window_element_pos(xstring section, xstring id) {
    autoconfig_window* w = autoconfig_window::find(section);
    return (w && w->contains(id)) ? (*w)[id].pos : vec2i{-1, -1};
}
ANK_FUNCTION_2(__test_window_element_pos);

static xstring __test_window_element_text(xstring section, xstring id) {
    autoconfig_window* w = autoconfig_window::find(section);
    return (w && w->contains(id)) ? (*w)[id].text() : xstring();
}
ANK_FUNCTION_2(__test_window_element_text);

static vec2i __test_window_element_size(xstring section, xstring id) {
    autoconfig_window* w = autoconfig_window::find(section);
    return (w && w->contains(id)) ? (*w)[id].size : vec2i{-1, -1};
}
ANK_FUNCTION_2(__test_window_element_size);

// "pack,id,offset" of an element's picture; "" if the element is missing.
static xstring __test_window_element_image(xstring section, xstring id) {
    autoconfig_window* w = autoconfig_window::find(section);
    if (!w || !w->contains(id)) {
        return xstring();
    }
    const image_desc desc = (*w)[id].image();
    bstring64 out;
    out.printf("%d,%d,%d", desc.pack, desc.id, desc.offset);
    return xstring(out.c_str());
}
ANK_FUNCTION_2(__test_window_element_image);

// Section of the open message dialog (each message type has its own layout); "" if none is open.
static xstring __test_message_dialog_section() {
    return window_message_dialog_section();
}
ANK_FUNCTION(__test_message_dialog_section);

static vec2i __test_window_element_screen_pos(xstring section, xstring id) {
    autoconfig_window* w = autoconfig_window::find(section);
    return (w && w->contains(id)) ? (*w)[id].screen_pos() : vec2i{-1, -1};
}
ANK_FUNCTION_2(__test_window_element_screen_pos);

// "text_x,text_y,bar_x,bar_y,bar_height,max_scroll" for a rich text element, as last drawn; "" if it has none.
static xstring __test_window_element_scrollbar(xstring section, xstring id) {
    autoconfig_window* w = autoconfig_window::find(section);
    ui::etext* t = (w && w->contains(id)) ? (*w)[id].dcast_etext() : nullptr;
    if (!t || !t->rich_text) {
        return xstring();
    }
    const rich_text_t& rt = *t->rich_text;
    bstring128 out;
    out.printf("%d,%d,%d,%d,%d,%d", rt.x_text, rt.y_text, rt.dscrollbar.pos.x, rt.dscrollbar.pos.y,
      rt.dscrollbar.height, rt.dscrollbar.max_scroll_position);
    return xstring(out.c_str());
}
ANK_FUNCTION_2(__test_window_element_scrollbar);

// "traders,valid_city" over live trade caravans and trade ships; valid_city counts those whose city is in use.
static xstring __test_trader_cities() {
    int traders = 0;
    int valid = 0;
    for (int i = 1; i < MAX_FIGURES; i++) {
        figure* f = figure_get(i);
        if (!f->is_valid() || (f->type != FIGURE_TRADE_CARAVAN && f->type != FIGURE_TRADE_SHIP)) {
            continue;
        }
        ++traders;
        const empire_city* city = g_empire.city(f->dcast()->empire_city().handle);
        if (city && city->in_use) {
            ++valid;
        }
    }
    bstring64 out;
    out.printf("%d,%d", traders, valid);
    return xstring(out.c_str());
}
ANK_FUNCTION(__test_trader_cities);

static int __test_statue_image(int type, int orientation, int variant) {
    return building_statue::get_image((e_building_type)type, orientation, variant);
}
ANK_FUNCTION_3(__test_statue_image);

static int __test_image_from_desc(int pack, int id, int offset) {
    return image_desc{(int16_t)pack, (int16_t)id, (int16_t)offset}.tid();
}
ANK_FUNCTION_3(__test_image_from_desc);

// An image's source bitmap name, size and animation length: "name wxh sprites" ("" for no image).
static pcstr __test_image_info(int image_id) {
    static bstring256 buf;
    const image_t* img = image_get(image_id);
    if (!img || image_id <= 0) {
        return "";
    }
    buf.printf("%s %dx%d %d", img->bmp.name.c_str(), img->width, img->height, img->animation.num_sprites);
    return buf.c_str();
}
ANK_FUNCTION_1(__test_image_info);

// The tile's value in the citizens' land routing grid, as last computed (4 clear land, 2 passable, 0 road, -1 blocked).
static int __test_routing_citizen_value(int x, int y) {
    return map_routing_citizen_value(tile2i(x, y).grid_offset());
}
ANK_FUNCTION_2(__test_routing_citizen_value);

// Set a game feature back to its built-in default (ignoring akhenaten.conf); false if there is no such feature.
static bool __test_game_feature_reset(xstring name) {
    game_features::game_feature* feature = game_features::find(name);
    if (!feature) {
        return false;
    }
    game_features::settings().set(feature->name, feature->defaultv);
    return true;
}
ANK_FUNCTION_1(__test_game_feature_reset);

// The picture the building's stock overlay for `resource` draws now ("image,copies"), "" if it has none.
static xstring __test_building_overlay_image(int bid, int resource) {
    building* b = building_get(bid);
    if (!b || !b->is_valid()) {
        return xstring("");
    }
    for (const auto& ov : b->overlay_anims) {
        if (ov.resource == (e_resource)resource) {
            int copies = 0;
            const int image_id = b->dcast()->overlay_anim_image(ov, copies);
            bstring64 out;
            out.printf("%d,%d", image_id, copies);
            return xstring(out.c_str());
        }
    }
    return xstring("");
}
ANK_FUNCTION_2(__test_building_overlay_image);

// The path a data file opens from, or "" when there is no such file.
static xstring __test_resolve_path(pcstr rel) {
    const vfs::path resolved = vfs::path(rel).resolve();
    return vfs::file_exists(resolved) ? xstring(resolved.c_str()) : xstring();
}
ANK_FUNCTION_1(__test_resolve_path);

static void __test_window_configs_reload() {
    autoconfig_window::refresh_all();
}
ANK_FUNCTION(__test_window_configs_reload);

static void __test_js_add_event_handler(pcstr event_name, pcstr funcname) {
    js_register_event_handler(event_name, funcname);
}
ANK_FUNCTION_2(__test_js_add_event_handler);

static void __test_js_dispatch_event(pcstr event_name) {
    js_call_event_handlers(event_name, {});
}
ANK_FUNCTION_1(__test_js_dispatch_event);


void __test_population_check_milestone() {
    g_city.population.reached_milestone(false);
}
ANK_FUNCTION(__test_population_check_milestone);


// "room:yard:resource:amount;" for every storage room, in building id order.
static xstring __test_storage_rooms_dump() {
    std::string out;
    buildings_valid_do([&](building& b) {
        if (b.type != BUILDING_STORAGE_ROOM) {
            return;
        }
        const resource_value& v = b.stored_first();
        out += std::to_string(b.id) + ":" + std::to_string(b.main()->id) + ":" + std::to_string((int)v.type) + ":"
               + std::to_string(v.value) + ";";
    });
    return xstring(out.c_str());
}
ANK_FUNCTION(__test_storage_rooms_dump);


static void __test_figure_set_formation_id(int fid, int formation_id) {
    figure* f = figure_get(fid);
    if (f && f->id) {
        f->formation_id = (short)formation_id;
    }
}
ANK_FUNCTION_2(__test_figure_set_formation_id);

// The largest image offset a wharf's current animation reaches over one cycle (from its first image).
static int __test_wharf_anim_max_offset(int bid) {
    building* b = building_get(bid);
    auto* wharf = (b && b->is_valid()) ? b->dcast_wharf() : nullptr;
    if (!wharf) {
        return -1;
    }
    int most = 0;
    const int cycle = b->anim.max_frames * std::max<int>(1, b->anim.frame_duration);
    for (int frame = 0; frame < cycle; frame++) {
        most = std::max(most, wharf->anim_frame_offset(frame));
    }
    return most;
}
ANK_FUNCTION_1(__test_wharf_anim_max_offset);

// Open a warship's or transport's orders panel, as its Orders button does.
static void __test_open_ship_orders(int fid) {
    window_city_open_ship_orders(fid);
}
ANK_FUNCTION_1(__test_open_ship_orders);

// Post an event message on the general template as a scenario event does: the event's item and amount fill the
// message's request fields (item 0 for an event that requests nothing, such as a flood).
static void __test_post_event_message(int item, int amount, int title_id, int body_id, int phrase_id) {
    event_ph_t event{};
    event.item.value = item;
    event.amount.value = amount;
    city_message_post_full(true, "message_template_general", &event, -1, title_id, body_id, phrase_id, 0, 0);
}
ANK_FUNCTION_5(__test_post_event_message);


static int __test_formation_figure_type(int formation_id) {
    formation* m = formation_get(formation_id);
    return m ? m->figure_type : -1;
}
ANK_FUNCTION_1(__test_formation_figure_type);

// Starts a melee between fid and a figure on (x, y), the way figures meet on a tile.
static int __test_figure_attack_figure_at(int fid, int x, int y) {
    figure* f = figure_get(fid);
    if (!f || !f->is_alive()) {
        return 0;
    }
    f->figure_combat_attack_figure_at(tile2i(x, y).grid_offset());
    return f->action_state;
}
ANK_FUNCTION_3(__test_figure_attack_figure_at);


static void __test_building_set_distance_from_entry(int bid, int distance) {
    building* b = building_get(bid);
    if (b && b->is_valid()) {
        b->distance_from_entry = (short)distance;
    }
}
ANK_FUNCTION_2(__test_building_set_distance_from_entry);

static int __test_population_yearly_births() {
    g_city.population.yearly_calculate_births();
    return g_city.population.yearly_births;
}
ANK_FUNCTION(__test_population_yearly_births);

// Lets the Mac run the iPhone layout: the inner-screen top menu needs iOS and a wide screen.
static void __test_pretend_ios(bool on) {
    screen_pretend_ios(on);
}
ANK_FUNCTION_1(__test_pretend_ios);

static int __test_viewport_y() {
    return g_camera.offset.y;
}
ANK_FUNCTION(__test_viewport_y);

static int __test_viewport_width() {
    return g_camera.size_pixels.x;
}
ANK_FUNCTION(__test_viewport_width);

static int __test_house_population(int bid) {
    building* b = building_get(bid);
    auto* house = (b && b->is_valid()) ? b->dcast_house() : nullptr;
    return house ? house->house_population() : -1;
}
ANK_FUNCTION_1(__test_house_population);


// Scenario fishing point `index` packed as x * 1000 + y; -1 when unset.
static int __test_scenario_fishing_point(int index) {
    if (index < 0 || index >= (int)g_scenario.fishing_points.size()) {
        return -1;
    }
    tile2i p = g_scenario.fishing_points[index];
    return p.valid() && p.x() > 0 ? p.x() * 1000 + p.y() : -1;
}
ANK_FUNCTION_1(__test_scenario_fishing_point);

// Boat routing distance over water from (x1,y1) to (x2,y2); 0 or less when a boat can't get there.
static int __test_boat_water_distance(int x1, int y1, int x2, int y2) {
    map_routing_calculate_distances_water_boat(tile2i(x1, y1));
    return map_routing_distance(tile2i(x2, y2));
}
ANK_FUNCTION_4(__test_boat_water_distance);

// Where a fishing boat at its fishing point would move when the point's tile is taken, packed x * 1000 + y; -1 none.
static int __test_fishing_boat_alternative_tile(int fid) {
    figure* f = figure_get(fid);
    tile2i alt;
    if (!f || !map_water_find_alternative_fishing_boat_tile(*f, alt)) {
        return -1;
    }
    return alt.x() * 1000 + alt.y();
}
ANK_FUNCTION_1(__test_fishing_boat_alternative_tile);

// Boat routing value of a tile: 0 open water a boat can sail, negative blocked (shore, edge, bridge).
static int __test_boat_routing_value(int x, int y) {
    return map_water_grid(tile2i(x, y).grid_offset());
}
ANK_FUNCTION_2(__test_boat_routing_value);

static void __test_fishing_points_reset() {
    g_city.fishing_points.reset();
}
ANK_FUNCTION(__test_fishing_points_reset);


static int __test_fishing_boats_requested() {
    return g_city.buildings.fishing_boats_requested;
}
ANK_FUNCTION(__test_fishing_boats_requested);

// Put a shipwright on an order: what it builds (FIGURE_FISHING_BOAT, FIGURE_TRANSPORT_SHIP, ...) and its progress.
static void __test_shipyard_set_order(int bid, int process_type, int progress) {
    building* b = building_get(bid);
    auto* shipyard = (b && b->is_valid()) ? b->dcast_shipyard() : nullptr;
    if (!shipyard) {
        return;
    }
    shipyard->runtime_data().process_type = (e_figure_type)process_type;
    b->progress = (uint16_t)progress;
}
ANK_FUNCTION_3(__test_shipyard_set_order);

// The wharf's water access point (where its boats dock), packed x * 1000 + y; -1 none.
static int __test_wharf_water_access(int bid) {
    building* b = building_get(bid);
    auto* wharf = (b && b->is_valid()) ? b->dcast_wharf() : nullptr;
    if (!wharf) {
        return -1;
    }
    tile2i p = wharf->get_water_access_tiles().point_a;
    return p.valid() ? p.x() * 1000 + p.y() : -1;
}
ANK_FUNCTION_1(__test_wharf_water_access);

static void __test_figure_set_destination_tile(int fid, int x, int y) {
    figure* f = figure_get(fid);
    if (f && f->is_valid()) {
        f->destination_tile = tile2i(x, y);
    }
}
ANK_FUNCTION_3(__test_figure_set_destination_tile);

// Put a figure on a tile (e.g. soldiers on parade, without walking them there).
static void __test_figure_place(int fid, int x, int y) {
    figure* f = figure_get(fid);
    if (!f || !f->is_valid()) {
        return;
    }
    f->map_figure_remove();
    f->tile = tile2i(x, y);
    f->previous_tile = f->tile;
    f->cc_coords = {15 * x, 15 * y};
    f->map_figure_add();
}
ANK_FUNCTION_3(__test_figure_place);


// The figure's animation for its state, then its picture, without running its action.


// The panel a tap on the fort opens on a touch screen: its company's orders.
void __test_show_company_orders(int bid) {
    building* b = building_get(bid);
    if (!b || !b->is_valid()) {
        return;
    }

    events::emit(event_show_tile_info{b->tile, true, "test", true});
}
ANK_FUNCTION_1(__test_show_company_orders);

// Centre of the Orders button shown while a company is selected to move (drawn on touch screens).
static vec2i __test_company_orders_button_pos() {
    return window_city_company_orders_button_center();
}
ANK_FUNCTION(__test_company_orders_button_pos);

static vec2i __test_company_rotate_button_pos() {
    return window_city_company_rotate_button_center();
}
ANK_FUNCTION(__test_company_rotate_button_pos);

// Send a company to a tile the way a tap on the map does; it then counts as away from its fort.
static void __test_company_move_to(int formation_id, int x, int y) {
    formation* m = formation_get(formation_id);
    if (m && m->in_use) {
        formation_batalion_move_to(m, tile2i(x, y));
    }
}
ANK_FUNCTION_3(__test_company_move_to);

// Top edges of the touch buttons by the city view's right edge, to compare with the top menu bar.
static int __test_company_orders_button_top() {
    return window_city_company_orders_button_top();
}
ANK_FUNCTION(__test_company_orders_button_top);

static int __test_construction_rotate_button_top() {
    return window_city_construction_rotate_button_top();
}
ANK_FUNCTION(__test_construction_rotate_button_top);

// The Rotate button shown while placing a building that turns (statues, monuments), on touch screens.
static vec2i __test_construction_rotate_button_pos() {
    return window_city_construction_rotate_button_center();
}
ANK_FUNCTION(__test_construction_rotate_button_pos);

static int __test_construction_rotate_button_width() {
    return window_city_construction_rotate_button_width();
}
ANK_FUNCTION(__test_construction_rotate_button_width);

static pcstr __test_construction_rotate_button_text() {
    return window_city_construction_rotate_button_text();
}
ANK_FUNCTION(__test_construction_rotate_button_text);


// Offset of an element's picture in its image group (e.g. a company order button in group 34), -1 if absent.
int __test_info_ui_image_offset(pcstr element_id) {
    auto& context = common_info_window::get_object_info();
    if (!context.ui || !element_id || !context.ui->contains(element_id)) {
        return -1;
    }
    return (*context.ui)[element_id].image().offset;
}
ANK_FUNCTION_1(__test_info_ui_image_offset);


static vec2i __test_info_ui_screen_pos(pcstr element_id) {
    object_info& context = common_info_window::get_object_info();
    if (!element_id || !*element_id || !context.ui || !context.ui->contains(element_id)) {
        return vec2i{-1, -1};
    }
    return (*context.ui)[element_id].screen_pos();
}
ANK_FUNCTION_1(__test_info_ui_screen_pos);

static vec2i __test_info_offset() {
    return common_info_window::get_object_info().offset;
}
ANK_FUNCTION(__test_info_offset);

static vec2i __test_info_bgsize() {
    return common_info_window::get_object_info().bgsize;
}
ANK_FUNCTION(__test_info_bgsize);

static float __test_window_ui_scale_for(xstring id) {
    return window_ui_scale_for(id);
}
ANK_FUNCTION_1(__test_window_ui_scale_for);

static float __test_render_ui_scale() {
    return g_render.ui_scale();
}
ANK_FUNCTION(__test_render_ui_scale);

// Values a window element's textfn leaves on the MuJS stack over `calls` calls. Measured here because
// a script caller would discard them when this native call returns.
static int __test_window_textfn_stack_growth(xstring section, xstring id, int calls) {
    autoconfig_window* w = autoconfig_window::find(section);
    if (!w || !w->contains(id)) {
        return -1;
    }
    const xstring& ref = (*w)[id].js_ref(ui::element::TEXTFN);
    if (ref.empty()) {
        return -1;
    }
    js_State* J = js_vm_state();
    const int top = J->top;
    for (int i = 0; i < calls; ++i) {
        js_call_function(ref, 0, 0);
    }
    const int growth = J->top - top;
    J->top = top;
    return growth;
}
ANK_FUNCTION_3(__test_window_textfn_stack_growth);


// Units of papyrus the yard would send to a scribal school, library or office now, else 0.
storage_worker_task building_storageyard_deliver_papyrus_to_scribal_school(building* b);
static int __test_storageyard_papyrus_task_amount(int yard_bid) {
    building* b = building_get(yard_bid);
    if (!b || !b->dcast_storage_yard()) {
        return 0;
    }
    storage_worker_task task = building_storageyard_deliver_papyrus_to_scribal_school(b);
    return task.result == STORAGEYARD_TASK_DELIVERING ? task.amount : 0;
}
ANK_FUNCTION_1(__test_storageyard_papyrus_task_amount);

static int __test_building_need_resource_amount(int bid, int resource) {
    building* b = building_get(bid);
    return (b && b->is_valid() && resource > RESOURCE_NONE && resource < RESOURCES_MAX)
             ? b->need_resource_amount((e_resource)resource)
             : 0;
}
ANK_FUNCTION_2(__test_building_need_resource_amount);


void city_resource_calculate_storageyard_stocks();
static void __test_calculate_storageyard_stocks() {
    city_resource_calculate_storageyard_stocks();
}
ANK_FUNCTION(__test_calculate_storageyard_stocks);


static int __test_map_multi_tile_xy(int x, int y) {
    return map_property_multi_tile_xy(tile2i(x, y).grid_offset());
}
ANK_FUNCTION_2(__test_map_multi_tile_xy);

static bool __test_map_is_draw_tile(int x, int y) {
    return map_property_is_draw_tile(tile2i(x, y).grid_offset()) != 0;
}
ANK_FUNCTION_2(__test_map_is_draw_tile);

// Writes a 2x2 building's tile layout (draw tile at the bottom-left, as for the north view) without
// touching the buildings or images on those tiles.
static void __test_map_set_2x2_layout(int x, int y) {
    for (int dy = 0; dy < 2; dy++) {
        for (int dx = 0; dx < 2; dx++) {
            const int g = tile2i(x + dx, y + dy).grid_offset();
            map_property_set_multi_tile_size(g, 2);
            map_property_set_multi_tile_xy(g, dx, dy, dx == 0 && dy == 1);
        }
    }
}
ANK_FUNCTION_2(__test_map_set_2x2_layout);


// Recount buildings by type as the city does once a day (and on load).
static void __test_update_building_counters() {
    g_city.buildings.update_counters();
}
ANK_FUNCTION(__test_update_building_counters);

// How a building is destroyed: "fire", "collapse" or "enemy".
static void __test_building_destroy(int bid, xstring how) {
    building* b = building_get(bid);
    if (!b || !b->is_valid()) {
        return;
    }
    b = b->main();
    if (how == "fire") {
        b->destroy_by_fire();
    } else if (how == "collapse") {
        b->destroy_by_collapse();
    } else if (how == "enemy") {
        b->destroy_by_enemy();
    }
}
ANK_FUNCTION_2(__test_building_destroy);

// The figure's animation for its state, then its picture, without running its action (upstream's
// __test_figure_refresh_image redraws the picture only).
static void __test_figure_refresh_animation_and_image(int fid) {
    figure* f = figure_get(fid);
    if (!f || !f->is_alive()) {
        return;
    }
    f->dcast()->update_animation();
    f->figure_image_update(true);
}
ANK_FUNCTION_1(__test_figure_refresh_animation_and_image);
