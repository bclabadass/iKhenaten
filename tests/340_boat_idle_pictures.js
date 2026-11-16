// A ferry or fishing boat at rest shows its own idle pictures in every facing. Their idle animations started at
// frame 3 of an 8-picture group (one per facing), and the facing is added on top, so facings 5-7 ran into the next
// group: a waiting ferry (Sprmain 140) showed a warship (141), as Brendan saw at Abdjedu's ferry landings, and a
// fishing boat at its wharf showed its sinking frames (136; the idle pictures are 137). A boat that has stopped has
// direction 8 (arrived; 9 and 10 for reroute and can't reach), and the picture took that as a facing too, landing in
// the next group whatever the start; a stopped figure now faces the way it came.
// Markers:
//   [test-marker] ferry_idle_own_pictures
//   [test-marker] fishing_boat_idle_own_pictures

var T340_FERRY_WAITING = 4      // ACTION_4_FERRY_BOAT_WAITING
var T340_FISHING_AT_WHARF = 4   // ACTION_4_FISHING_BOAT_AT_WHARF

// Every facing's idle picture lies in Sprmain group `group`.
function t340_idle_in_group(label, type, action, group) {
    var fid = test_figure_create(type, -1, -1)
    if (!fid) {
        return false
    }
    var first = __test_image_from_desc(PACK_SPR_MAIN, group, 0)
    var end = __test_image_from_desc(PACK_SPR_MAIN, group + 1, 0)
    __test_figure_set_action(fid, action)
    var got = []
    var ok = true
    for (var dir = 0; dir <= 10; dir++) {
        __test_figure_set_direction(fid, dir)
        __test_figure_refresh_animation_and_image(fid)
        var img = __test_figure_main_image_id(fid)
        got.push(img - first)
        if (img < first || img >= end) {
            ok = false
        }
    }
    __log_info_native('[test:340] ' + label + ' idle pictures (offsets in group ' + group + ', which holds '
        + (end - first) + '): ' + got.join(' '))
    __test_figure_kill(fid)
    return ok
}

function run_test() {
    test_reload_city_session('data/default.map')
    __camera_rotate_north()
    // Without the game's images (CI) the groups are missing and the pictures can't be checked.
    if (__test_image_from_desc(PACK_SPR_MAIN, 140, 0) <= 0) {
        __log_marker('boat_idle_check_skipped_no_images')
        __test_signal_ready()
        return
    }
    if (t340_idle_in_group('ferry', FIGURE_FERRY_BOAT, T340_FERRY_WAITING, 140)) {
        __log_marker('ferry_idle_own_pictures')
    }
    if (t340_idle_in_group('fishing boat', FIGURE_FISHING_BOAT, T340_FISHING_AT_WHARF, 137)) {
        __log_marker('fishing_boat_idle_own_pictures')
    }
    __test_signal_ready()
}

function check_valid() {
    return (__test_find_inlog('[test-marker] ferry_idle_own_pictures')
            && __test_find_inlog('[test-marker] fishing_boat_idle_own_pictures'))
        || __test_find_inlog('[test-marker] boat_idle_check_skipped_no_images')
}
