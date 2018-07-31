package sample.controllerOfFxml;

import com.jfoenix.controls.JFXPasswordField;
import com.jfoenix.controls.JFXTextField;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.stage.Stage;
import org.json.simple.JSONObject;
import sample.Main;
import sample.NodeJsServer;


import javafx.event.ActionEvent;

import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.util.ResourceBundle;


public class loginController implements Initializable{

    @FXML
    private JFXTextField username;
    @FXML
    private JFXPasswordField password;
    @FXML
    private Label uname_vali,pass_vali;


    public String responseStatus, loginRequest;
    Main main = new Main();

    public String jsonToString(String uname, String pass){

        JSONObject obj = new JSONObject();

        obj.put("uname", uname);
        obj.put("password", pass);


        StringWriter out = new StringWriter();
        try {
            obj.writeJSONString(out);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println(obj);
        String jsonText = out.toString();

        return jsonText;
    }

    @FXML
    public void onLogin(ActionEvent event) throws Exception {
        String uname = username.getText();
        String pass = password.getText();

        if (uname.equals("")) {
            uname_vali.setText("Username cannot be empty!");
        } else if (pass.equals("")) {
            uname_vali.setText("");
            pass_vali.setText("Password cannot be empty");
        } else {
            uname_vali.setText("");
            System.out.println(uname + pass);

            loginRequest = jsonToString(uname, pass);

            //Connection starts here..
            NodeJsServer client = new NodeJsServer();
            String ip = "localhost";
            int port = 6996;
            client.socketConnect(ip, port);

            System.out.println("Sending Username Password: " + loginRequest);
            responseStatus = client.echo(loginRequest);
            System.out.println("Received response: " + responseStatus);

            /**
             * Way to communicate between different different controller
             */
            //*****************************************************************************//
            if (responseStatus.equals("invalid")) {
                System.out.println("Login UnSuccessfull!!");
                System.out.println("Username already in use!!");
                FXMLLoader loader = new FXMLLoader();
                loader.setLocation(getClass().getResource("../fxml/registerError.fxml"));
                Parent root = loader.load();

                Scene scene = new Scene(root);

                registerErrorController controller = loader.getController();

                controller.initData("Invalid Login. Check Username and Password");

                Stage window = (Stage) ((Node) event.getSource()).getScene().getWindow();
                window.setScene(scene);
                window.show();
            } else {

                System.out.println("Login Successfull!!");

                FXMLLoader loader = new FXMLLoader();
                loader.setLocation(getClass().getResource("../fxml/chatRoom.fxml"));
                Parent root = loader.load();

                Scene scene = new Scene(root);

                chatRoomController controller = loader.getController();

                controller.initData(responseStatus);

                Stage window = (Stage) ((Node) event.getSource()).getScene().getWindow();
                window.setScene(scene);
                window.show();

            }
            //*****************************************************************************//

        }
    }

    @FXML
    public void onForgetPassword(ActionEvent event) throws Exception {
        FXMLLoader loader = new FXMLLoader();
        loader.setLocation(getClass().getResource("../fxml/sample.fxml"));
        Parent root = loader.load();

        Scene scene = new Scene(root);


        Stage window = (Stage) ((Node) event.getSource()).getScene().getWindow();
        window.setScene(scene);
        window.show();
    }
    public void onBack() throws Exception{
        main.openWelcome();
    }
    @Override
    public void initialize(URL url, ResourceBundle rb){
    }


}
