// Elevation (cliff) tiles keep the picture the map stores for them. On load and on rotation the elevation pass
// repainted every raised tile with Caesar 3's slope pictures, Terrain group 9, which in Pharaoh's data are the
// irrigation ditches: Behdet's map has a small raised ring west of the road, which showed as an outline of ditches
// on the sand that nothing could clear (Brendan, on the Duo).
// Markers:
//   [test-marker] behdet_elevation_no_ditches

function run_test() {
    __game_load_mission(6, 1)
    __test_process_events()
    __test_pump_frames(4)

    var ditches = __test_image_from_desc(PACK_TERRAIN, 9, 0)
    var raised = 0
    var drawn_as_ditch = []
    for (var y = 0; y < __scenario_map.height; y++) {
        for (var x = 0; x < __scenario_map.width; x++) {
            var t = { x: x, y: y }
            if (!__map_terrain_is(t, TERRAIN_ELEVATION)) {
                continue
            }
            raised++
            var img = __map_image_at(t)
            if (img >= ditches && img < ditches + 64) {
                drawn_as_ditch.push(x + ',' + y + ':' + (img - ditches))
            }
        }
    }
    __log_info_native('[test:342] Behdet: ' + raised + ' raised tiles, ' + drawn_as_ditch.length + ' drawn with ditch pictures '
        + drawn_as_ditch.slice(0, 8).join(' '))
    if (raised > 0 && drawn_as_ditch.length == 0) {
        __log_marker('behdet_elevation_no_ditches')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] behdet_elevation_no_ditches')
}
