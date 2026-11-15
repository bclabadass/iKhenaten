#pragma once

#include "message_dialog_new.h"

namespace ui {
    struct message_dialog_image : public message_dialog_base {
        message_dialog_image() : message_dialog_base("message_dialog_window_image") {}
        virtual void draw_background_content() override;
        virtual void init_data(xstring text_id, int message_id, void (*background_callback)(void)) override;
        virtual void archive_load(archive arch) override;
        virtual void draw_city_message_text(const lang_message& msg) override;
    };
}
