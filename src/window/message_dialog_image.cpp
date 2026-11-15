#include "message_dialog_image.h"

#include "city/city_message.h"
#include "graphics/image.h"
#include "graphics/image_groups.h"
#include "io/gamefiles/lang.h"

void ui::message_dialog_image::init_data(xstring text_id, int message_id, void (*background_callback)(void)) {
    message_dialog_base::init_data(text_id, message_id, background_callback);
    restore_layout_size();

    const lang_message& msg = lang_get_message(text_id);
    image_desc picture{msg.image.pack > 0 ? msg.image.pack : (int16_t)PACK_UNLOADED, msg.image.id, msg.image.offset};
    if (message_id != -1) {
        const city_message& city_msg = city_message_get(message_id);
        if (city_msg.background_img && city_msg.background_img != messages::IMAGE_FROM_SCHEME) {
            const image_t* img = image_get(city_msg.background_img);
            picture = img ? img->desc() : image_desc{};
        }
    }
    ui["image"].image(picture);
}

void ui::message_dialog_image::draw_background_content() {
    draw_content(lang_get_message(text_id));
}

void ui::message_dialog_image::draw_city_message_text(const lang_message& msg) {
    draw_city_message_text_header_paragraph(msg);
}

void ui::message_dialog_image::archive_load(archive arch) {
    message_dialog_base::archive_load(arch);
    keep_layout_size();
}
