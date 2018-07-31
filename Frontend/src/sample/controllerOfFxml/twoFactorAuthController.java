package sample.controllerOfFxml;

import com.jfoenix.controls.JFXTextField;
import com.sun.jndi.toolkit.url.UrlUtil;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.stage.Stage;
import org.json.simple.JSONObject;
import sample.Main;
import sample.NodeJsServer;

import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.util.ResourceBundle;

public class twoFactorAuthController implements Initializable {
    @FXML
    private JFXTextField oneTimePassword;
    @FXML
    private Label otp_vali;

    public String responseStatus;
    Main main = new Main();


    public void onSubmit(ActionEvent event)throws Exception {
        String uotp = oneTimePassword.getText();

        //Connection starts here..
        NodeJsServer client = new NodeJsServer();
        String ip = "localhost";
        int port = 6999;
        client.socketConnect(ip, port);

        /*Send otp in JSON String */

        JSONObject obj = new JSONObject();
        obj.put("otp",uotp);
        StringWriter out = new StringWriter();
        try {
            obj.writeJSONString(out);
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println(obj);
        String jsonText = out.toString();
        System.out.println("Sending OTP: " + jsonText);
        responseStatus=client.echo(jsonText);
        //If rs=0, means otp is wrong else otp is correct & user is registered.//

        if (responseStatus.equals("otpError"))
        {
            System.out.println("Registration UnSuccessfull!!Your OTP is wrong!!");
            otp_vali.setText("Incorrect OTP");
        }
        else{
            System.out.println("Registration Successfull!!Your OTP is Right!");
            FXMLLoader loader = new FXMLLoader();
            loader.setLocation(getClass().getResource("../fxml/chatRoom.fxml"));
            Parent root = loader.load();

            Scene scene = new Scene(root);

            chatRoomController controller = loader.getController();

            controller.initData(responseStatus);

            Stage window = (Stage) ((Node) event.getSource()).getScene().getWindow();
            window.setScene(scene);
        }
    }

    @Override
    public void initialize(URL url, ResourceBundle rb){

    }

}
