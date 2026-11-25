// A campaign map's prebuilt city has to run from the first day (Brendan, 2026-11-25: "all prebuilt buildings lose
// employment immediately and houses devolve due to no food contained in the building upon mission load. Also -
// employment seekers do not generate until someone moves into a vacant plot", "others are still broken, especially
// ones like kebet", "preexisting monuments do not carry over like khmun's pyramid"). The mission1.pak entry's census
// and the houses' food come with its buildings; Pharaoh 1.0's entries (Kebet) have their pictures renumbered; the
// original's finished generic pyramid becomes the mission's own (Khmun, Menat Khufu).
// Markers:
//   [test-marker] t928_census
//   [test-marker] t928_house_food
//   [test-marker] t928_employment_kept
//   [test-marker] t928_labor_seekers
//   [test-marker] t928_kebet_town
//   [test-marker] t928_pyramids

var T928_TICKS_PER_DAY = 50
var T928_MARKERS = ['t928_census', 't928_house_food', 't928_employment_kept', 't928_labor_seekers', 't928_kebet_town',
    't928_pyramids']

function t928_is_house(t) {
    return t >= BUILDING_HOUSE_VACANT_LOT && t <= BUILDING_HOUSE_PALATIAL_ESTATE
}

function t928_city() {
    var s = { buildings: 0, houses: 0, people: 0, food: 0, staffed: 0 }
    for (var b = 1; b < 4000; b++) {
        var t = __building_type(b)
        if (t <= 0) {
            continue
        }
        s.buildings++
        var bb = city.get_building(b)
        if (t928_is_house(t)) {
            s.houses++
            s.people += __test_house_population(b)
            s.food += __test_house_food_total(b)
        } else if (bb.max_workers > 0 && bb.num_workers > 0) {
            s.staffed++
        }
    }
    return s
}

// Every building tile shows a picture of the building's own set, not a v147 number that is now another set's.
function t928_misdrawn_tiles() {
    var bad = []
    for (var y = 0; y < 228; y++) {
        for (var x = 0; x < 228; x++) {
            var b = __building_at(x, y)
            if (b <= 0) {
                continue
            }
            var info = String(__test_image_info(__test_map_image(x, y)))
            if (info == '' || info.indexOf('radar') == 0 || (__building_type(b) == BUILDING_ROADBLOCK && info.indexOf('Housng1a') != 0)) {
                bad.push(x + ',' + y + ' [' + info + ']')
            }
        }
    }
    return bad
}

function t928_bare_building_tiles() {
    var n = 0
    for (var y = 0; y < 228; y++) {
        for (var x = 0; x < 228; x++) {
            if (__map_terrain_is({ x: x, y: y }, 0x8) && __building_at(x, y) == 0) {
                n++
            }
        }
    }
    return n
}

function t928_pyramid(sid, x, y) {
    __game_load_mission(sid, 1)
    var main = 0
    for (var b = 1; b < 4000 && !main; b++) {
        if (__building_type(b) == BUILDING_SMALL_MUDBRICK_PYRAMID && city.get_building(b).prev_part_building_id == 0) {
            main = b
        }
    }
    var parts = 0
    for (var p = main; p > 0 && parts < 40; p = city.get_building(p).next_part_building_id) {
        parts++
    }
    var congrats = 0
    for (var mi = 0; mi < __city_message_count(); mi++) {
        var key = __lang_get_message_id(__city_message_mm_text_id(mi))
        if (key && key.indexOf('pyramid_congratulations') >= 0) {
            congrats++
        }
    }
    var t = main ? __building_tile(main) : { x: -1, y: -1 }
    __log_info_native('[test:928] m' + sid + ' pyramid ' + main + ' at ' + t.x + ',' + t.y + ' parts ' + parts + ' phase '
        + (main ? __test_monument_phase(main) : 'none') + ' congratulations ' + congrats)
    return main > 0 && t.x == x && t.y == y && parts == 16 && __test_monument_phase(main) == -1 && congrats == 0
}

function run_test() {
    if (!__game_has_campaign_data() || !__test_resolve_path('mission1.pak')) {
        __log_info_native('[test:928] no campaign data, skipped')
        T928_MARKERS.forEach(__log_marker)
        __test_signal_ready()
        return
    }

    // Thinis: 21 houses, 402 people, 1857 food in the entry.
    __game_load_mission(23, 1)
    var start = t928_city()
    var census = city.population_stats.current
    var workers = city.labor.workers_available
    __test_run_ticks(10 * T928_TICKS_PER_DAY)
    var later = t928_city()
    __log_info_native('[test:928] thinis start houses ' + start.houses + ' people ' + start.people + ' food ' + start.food
        + ' staffed ' + start.staffed + ', census ' + census + ' workers ' + workers + '; day 10 people ' + later.people
        + ' food ' + later.food + ' staffed ' + later.staffed)
    if (start.people > 0 && census == start.people && workers > 0) {
        __log_marker('t928_census')
    }
    if (start.food > 0 && later.food > 0) {
        __log_marker('t928_house_food')
    }
    if (start.staffed > 0 && later.staffed >= start.staffed && later.people >= start.people) {
        __log_marker('t928_employment_kept')
    }

    // Kebet: Pharaoh 1.0's entry, a walled town of 115 buildings.
    __game_load_mission(25, 1)
    var kebet = t928_city()
    var misdrawn = t928_misdrawn_tiles()
    var bare = t928_bare_building_tiles()
    __test_run_ticks(2 * T928_TICKS_PER_DAY)
    var seekers = __test_count_figures(FIGURE_LABOR_SEEKER)
    __log_info_native('[test:928] kebet buildings ' + kebet.buildings + ' houses ' + kebet.houses + ' people '
        + kebet.people + ', misdrawn ' + misdrawn.length + ' ' + misdrawn.slice(0, 6).join(' ') + ', bare ' + bare
        + ', labor seekers by day 2 ' + seekers)
    if (kebet.buildings >= 100 && kebet.houses > 0 && misdrawn.length == 0 && bare == 0) {
        __log_marker('t928_kebet_town')
    }
    if (seekers > 0) {
        __log_marker('t928_labor_seekers')
    }

    if (t928_pyramid(32, 81, 81) && t928_pyramid(26, 45, 110)) {
        __log_marker('t928_pyramids')
    }

    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return T928_MARKERS.every(function (m) { return __test_find_inlog('[test-marker] ' + m) })
}
