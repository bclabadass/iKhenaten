// A campaign map's prebuilt city (Brendan, 2026-11-25: "when a map comes with prebuilt structures, they will often be
// missing or incorrectly rendered ... (example middle kingdom - thinis)"). The original starts a mission from its
// mission1.pak entry, a save holding the buildings; our shipped maps carry only the grids, so the tiles had no
// building behind them and the start cleared them. The buildings now come from the pak entry: Thinis' Temple Complex
// of Osiris (with its altar and oracle, its courtyard laid out) and the family mansion, Byblos' archer and infantry
// forts with their companies.
// Markers:
//   [test-marker] t927_thinis_complex
//   [test-marker] t927_thinis_mansion
//   [test-marker] t927_no_bare_building_tiles
//   [test-marker] t927_byblos_forts

function t927_buildings_of(types) {
    var out = []
    for (var b = 1; b < 4000; b++) {
        if (types.indexOf(__building_type(b)) >= 0) {
            out.push(b)
        }
    }
    return out
}

function t927_bare_building_tiles() {
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

function run_test() {
    if (!__game_has_campaign_data() || !__test_resolve_path('mission1.pak')) {
        __log_info_native('[test:927] no campaign data, skipped')
        ;['t927_thinis_complex', 't927_thinis_mansion', 't927_no_bare_building_tiles', 't927_byblos_forts'].forEach(__log_marker)
        __test_signal_ready()
        return
    }

    __game_load_mission(23, 1)
    var complexes = t927_buildings_of([BUILDING_TEMPLE_COMPLEX_OSIRIS])
    var main = complexes.length ? complexes[0] : 0
    var parts = []
    for (var id = main; id > 0 && parts.length < 3; id = city.get_building(id).next_part_building_id) {
        parts.push(__building_type(id))
    }
    var t = main ? __building_tile(main) : { x: 0, y: 0 }
    // The courtyard reaches two tiles beside the temple; the original's picture there was its own numbering.
    var courtyard = String(__test_image_info(__test_map_image(t.x - 2, t.y)))
    var mansions = t927_buildings_of([BUILDING_FAMILY_MANSION]).length
    var bare = t927_bare_building_tiles()
    __log_info_native('[test:927] thinis complex ' + main + ' parts [' + parts.join(',') + '], courtyard [' + courtyard
        + '], family mansions ' + mansions + ', bare building tiles ' + bare)

    __game_load_mission(34, 1)
    var forts = []
    var forts_ok = true
    var found = t927_buildings_of([BUILDING_FORT_ARCHERS, BUILDING_FORT_INFANTRY, BUILDING_FORT_CHARIOTEERS])
    for (var i = 0; i < found.length; i++) {
        var f = city.get_building(found[i]).formation_id
        var want = __building_type(found[i]) == BUILDING_FORT_ARCHERS ? FIGURE_ARCHER : FIGURE_INFANTRY
        forts.push(__building_type(found[i]) + '/formation ' + f + ' of ' + __test_formation_figure_type(f))
        forts_ok = forts_ok && f > 0 && __test_formation_figure_type(f) == want
    }
    __log_info_native('[test:927] byblos forts ' + forts.join(', '))

    if (parts.length == 3 && parts[1] == BUILDING_TEMPLE_COMPLEX_ALTAR_SEBEK && parts[2] == BUILDING_TEMPLE_COMPLEX_ORACLE_MIN
        && courtyard.indexOf('Temple_nile') == 0) {
        __log_marker('t927_thinis_complex')
    }
    if (mansions == 1) {
        __log_marker('t927_thinis_mansion')
    }
    if (bare == 0) {
        __log_marker('t927_no_bare_building_tiles')
    }
    if (found.length == 2 && forts_ok) {
        __log_marker('t927_byblos_forts')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t927_thinis_complex')
        && __test_find_inlog('[test-marker] t927_thinis_mansion')
        && __test_find_inlog('[test-marker] t927_no_bare_building_tiles')
        && __test_find_inlog('[test-marker] t927_byblos_forts')
}
