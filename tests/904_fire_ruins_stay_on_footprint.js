// A storage yard's rooms are parts of it, and each laid ruins over its own size from its own corner: the rooms' config
// size is 3, so a burning yard spread ruins over the road and gardens next to it and stacked several on each tile. The
// stacked ruins were deleted without clearing their tiles, which kept pointing at their ids; once a new building took
// such an id, clearing the burnt tile deleted that building (Brendan, Saqqara 3..7). A burning building now lays ruins
// only on its own tiles, and loading a save turns the stale burnt tiles into plain rubble.
// Markers:
//   [test-marker] t904_ruins_on_footprint
//   [test-marker] t904_saved_burnt_tiles_repaired
//   [test-marker] t904_save_skipped

var __t904_ok = false

function t904_fail(msg) {
    __log_info_native('[test:904] FAIL ' + msg)
    __test_signal_ready()
}

// Tiles in [x0..x1]x[y0..y1] whose building is a burning ruin, and how many distinct ruins.
function t904_ruins(x0, y0, x1, y1) {
    var tiles = []
    for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
            var b = __building_at(x, y)
            if (b && city.get_building(b).type == BUILDING_BURNING_RUIN) {
                tiles.push(x + ',' + y)
            }
        }
    }
    return tiles
}

// Tiles that point at a deleted building, or show a burning ruin's picture without holding that ruin.
function t904_stale_tiles(w, h) {
    var ruin_first = __test_image_id_from_group(PACK_TERRAIN, 36, 0)
    var stale = []
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var id = __building_at(x, y)
            if (!id) {
                continue
            }
            var b = city.get_building(id)
            var img = __map_image_at({ x: x, y: y })
            var ruin_picture = ruin_first > 0 && img >= ruin_first && img < ruin_first + 36
            if (!b.state) {
                stale.push(x + ',' + y + '>' + id)
            } else if (ruin_picture && (b.type != BUILDING_BURNING_RUIN || b.tile.x != x || b.tile.y != y)) {
                stale.push(x + ',' + y + '>t' + b.type + '#' + id)
            }
        }
    }
    return stale
}

function run_test() {
    test_reload_city_session('data/default.map')
    __scenario_building_allow(BUILDING_STORAGE_YARD, true)
    __test_set_treasury(100000)
    var yard = test_building_place(BUILDING_STORAGE_YARD, 40, 40)
    if (!yard) {
        return t904_fail('storage yard not placed')
    }
    var t = __building_tile(yard)
    var all_ruins = 0
    for (var i = 1; i < 4000; i++) {
        var b = city.get_building(i)
        if (b && b.state && b.type == BUILDING_BURNING_RUIN) {
            all_ruins--
        }
    }
    __test_building_destroy(yard, 'fire')
    for (var i = 1; i < 4000; i++) {
        var b = city.get_building(i)
        if (b && b.state && b.type == BUILDING_BURNING_RUIN) {
            all_ruins++
        }
    }
    var inside = t904_ruins(t.x, t.y, t.x + 2, t.y + 2)
    var around = t904_ruins(t.x - 3, t.y - 3, t.x + 5, t.y + 5)
    __log_info_native('[test:904] yard at ' + t.x + ',' + t.y + ': ' + inside.length + ' ruin tiles on it, '
        + (around.length - inside.length) + ' outside, ' + all_ruins + ' ruins made')
    if (inside.length == 9 && around.length == 9 && all_ruins == 9) {
        __log_marker('t904_ruins_on_footprint')
    }

    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Saqqara 7.svx')) {
        __log_marker('t904_save_skipped')
    } else {
        __test_pump_frames(2)
        var stale = t904_stale_tiles(__scenario_map.width, __scenario_map.height)
        __log_info_native('[test:904] Saqqara 7 stale building tiles: ' + stale.length + ' ' + stale.slice(0, 20).join(' '))
        if (stale.length == 0) {
            __log_marker('t904_saved_burnt_tiles_repaired')
        }
    }
    test_reload_city_session('data/default.map')
    __t904_ok = true
    __test_signal_ready()
}

function check_valid() {
    return __t904_ok && __test_find_inlog('[test-marker] t904_ruins_on_footprint')
        && (__test_find_inlog('[test-marker] t904_saved_burnt_tiles_repaired')
            || __test_find_inlog('[test-marker] t904_save_skipped'))
}
