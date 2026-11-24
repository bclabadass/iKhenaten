// The altar and oracle each Temple Complex offers (Brendan, build 14177: their names in the build menu were wrong).
// Ra, Ptah and Osiris had each other's: Osiris offered the Altar of Amon and Oracle of Thoth (Ptah's), Ra Sebek and
// Min (Osiris's), Ptah Ma'at and Horus (Ra's). The original pairs them as its Temple help page lists them (and text
// group 189 orders them): Osiris Sebek/Min, Ra Ma'at/Horus, Ptah Amon/Thoth, Seth Anubis/Sekhmet, Bast Isis/Hathor.
// A complex saved with the old pairing gets its parts' types corrected on load.
// Markers:
//   [test-marker] t919_complexes_offer_own_upgrades
//   [test-marker] t919_menu_names_match
//   [test-marker] t919_old_save_parts_corrected

var t919_pairs = [
    { complex: BUILDING_TEMPLE_COMPLEX_OSIRIS, altar: BUILDING_TEMPLE_COMPLEX_ALTAR_SEBEK, oracle: BUILDING_TEMPLE_COMPLEX_ORACLE_MIN,
      names: ['Altar of Sebek', 'Oracle of Min'], old: [BUILDING_TEMPLE_COMPLEX_ALTAR_AMON, BUILDING_TEMPLE_COMPLEX_ORACLE_THOTH] },
    { complex: BUILDING_TEMPLE_COMPLEX_RA, altar: BUILDING_TEMPLE_COMPLEX_ALTAR_MAAT, oracle: BUILDING_TEMPLE_COMPLEX_ORACLE_HORUS,
      names: ["Altar of Ma'at", 'Oracle of Horus'], old: [BUILDING_TEMPLE_COMPLEX_ALTAR_SEBEK, BUILDING_TEMPLE_COMPLEX_ORACLE_MIN] },
    { complex: BUILDING_TEMPLE_COMPLEX_PTAH, altar: BUILDING_TEMPLE_COMPLEX_ALTAR_AMON, oracle: BUILDING_TEMPLE_COMPLEX_ORACLE_THOTH,
      names: ['Altar of Amon', 'Oracle of Thoth'], old: [BUILDING_TEMPLE_COMPLEX_ALTAR_MAAT, BUILDING_TEMPLE_COMPLEX_ORACLE_HORUS] },
    { complex: BUILDING_TEMPLE_COMPLEX_SETH, altar: BUILDING_TEMPLE_COMPLEX_ALTAR_ANUBIS, oracle: BUILDING_TEMPLE_COMPLEX_ORACLE_SEKHMET,
      names: ['Altar of Anubis', 'Oracle of Sekhmet'], old: null },
    { complex: BUILDING_TEMPLE_COMPLEX_BAST, altar: BUILDING_TEMPLE_COMPLEX_ALTAR_ISIS, oracle: BUILDING_TEMPLE_COMPLEX_ORACLE_HATHOR,
      names: ['Altar of Isis', 'Oracle of Hathor'], old: null },
]

function t919_place(type, x, y) {
    test_planner_enter_build_mode(type)
    city_planner.update(x, y)
    city_planner.construction_start(x, y)
    city_planner.construction_update(x, y)
    city_planner.construction_finalize()
    var bid = city_planner.last_created_building_id()
    test_planner_exit_build_mode()
    return bid
}

// Types of the complex's altar and oracle parts (the two parts after the temple).
function t919_part_types(bid) {
    var out = []
    var b = city.get_building(bid)
    while (b && b.next_part_building_id > 0 && out.length < 2) {
        out.push(b.next_part_building_id)
        b = city.get_building(b.next_part_building_id)
    }
    return out
}

function run_test() {
    var own = true, names = true, corrected = true, report = []
    var has_text = __loc(189, 0) == 'Altar of Sebek'
    for (var i = 0; i < t919_pairs.length; i++) {
        var p = t919_pairs[i]
        test_reload_city_session('data/default.map')
        __test_set_treasury(1000000)
        var bid = t919_place(p.complex, 60, 60)
        var parts = t919_part_types(bid)
        var types = parts.map(function (id) { return city.get_building(id).type })
        var ok = types.length == 2 && types[0] == p.altar && types[1] == p.oracle
        own = own && ok
        var shown = [__building_static_text(p.altar, 'build_menu_text'), __building_static_text(p.oracle, 'build_menu_text')]
        if (has_text) {
            names = names && shown[0] == p.names[0] && shown[1] == p.names[1]
        }
        var after = ''
        if (p.old && types.length == 2) {
            __test_building_set_type(parts[0], p.old[0])
            __test_building_set_type(parts[1], p.old[1])
            __test_save_memory('t919')
            __test_load_memory('t919')
            var fixed = [city.get_building(parts[0]).type, city.get_building(parts[1]).type]
            corrected = corrected && fixed[0] == p.altar && fixed[1] == p.oracle
            after = ', after an old-pairing save ' + fixed.join('/')
        }
        report.push(p.complex + ': parts ' + types.join('/') + ' want ' + p.altar + '/' + p.oracle + ' [' + shown.join(', ') + ']' + after)
    }
    __log_info_native('[test:919] ' + report.join('; ') + (has_text ? '' : ' (no game text: names not checked)'))
    if (own) {
        __log_marker('t919_complexes_offer_own_upgrades')
    }
    if (names) {
        __log_marker('t919_menu_names_match')
    }
    if (corrected) {
        __log_marker('t919_old_save_parts_corrected')
    }
    test_reload_city_session('data/default.map')
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t919_complexes_offer_own_upgrades')
        && __test_find_inlog('[test-marker] t919_menu_names_match')
        && __test_find_inlog('[test-marker] t919_old_save_parts_corrected')
}
