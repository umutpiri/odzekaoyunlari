package com.odzekaoyunlari;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.os.Bundle;
import android.view.WindowManager;
import com.google.android.gms.ads.MobileAds;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "odZekaOyunlari";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        MobileAds.initialize(this, "ca-app-pub-8980970186700232~1866460375");
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
}
