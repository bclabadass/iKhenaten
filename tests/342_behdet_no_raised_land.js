// Behdet's map has a leftover ring of heights west of the road (no other mission map stores any). On load the
// Caesar 3 elevation pass made its edge tiles raised ('cliff') land, unbuildable and marked on the minimap, and
// repainted them with its slope pictures, Terrain group 9, which in Pharaoh's data are the irrigation ditches: an
// outline of ditches on the sand that nothing could clear (Brendan, on the Duo). Pharaoh has no raised land, so a
// map's stored heights are dropped on load, and a raised tile keeps the picture the map stores for it.
// Markers:
//   [test-marker] behdet_no_raised_land
//   [test-marker] behdet_ring_plain_sand

// Edge tiles of Behdet's ring.
var T342_RING = [[62, 66], [61, 67], [63, 67], [59, 70], [65, 70], [62, 74], [60, 72], [64, 72]]

function run_test() {
    __game_load_mission(6, 1)
    __test_process_events()
    __test_pump_frames(4)

    var raised = 0
    for (var y = 0; y < __scenario_map.height; y++) {
        for (var x = 0; x < __scenario_map.width; x++) {
            if (__map_terrain_is({ x: x, y: y }, TERRAIN_ELEVATION)) {
                raised++
            }
        }
    }

    var ditches = __test_image_from_desc(PACK_TERRAIN, 9, 0)
    var ditch_pictures = 0
    for (var i = 0; i < T342_RING.length; i++) {
        var img = __map_image_at({ x: T342_RING[i][0], y: T342_RING[i][1] })
        if (img >= ditches && img < ditches + 64) {
            ditch_pictures++
        }
    }
    __log_info_native('[test:342] Behdet: ' + raised + ' raised tiles, ' + ditch_pictures + ' of ' + T342_RING.length
        + ' ring tiles drawn as ditches')
    if (raised == 0) {
        __log_marker('behdet_no_raised_land')
    }
    // Without the game's images (CI) there are no ditch pictures to tell apart.
    if (ditches <= 0) {
        __log_marker('behdet_ring_check_skipped_no_images')
    } else if (ditch_pictures == 0) {
        __log_marker('behdet_ring_plain_sand')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] behdet_no_raised_land')
        && (__test_find_inlog('[test-marker] behdet_ring_plain_sand')
            || __test_find_inlog('[test-marker] behdet_ring_check_skipped_no_images'))
}
