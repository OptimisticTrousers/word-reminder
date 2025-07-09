package com.wordreminder.www;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TextSelectionAction")
public class TextSelectionActionPlugin extends Plugin {

    CharSequence selectionText = "";
    @Override
    public void load() {
        Intent intent = getActivity().getIntent();
        this.selectionText = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT);;
    }

    @PluginMethod()
    public void getSelectionText(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("selectionText", this.selectionText);
        call.resolve(ret);
    }
}
