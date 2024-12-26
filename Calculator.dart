import 'package:flutter/material.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  

  String inputValue = "";
  String calculatedValue = "";
  String operator = "";

  @override
  Widget build(BuildContext context) {
    double size = MediaQuery.of(context).size.width / 5;
    return MaterialApp(
      home: Scaffold(
        backgroundColor: Colors.black,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              children: [
                Container(
                  alignment: Alignment.bottomRight,
                  padding: EdgeInsets.all(20),
                  child: Text(
                    inputValue,
                    style: TextStyle(color: Colors.white, fontSize: 60),
                  ),
                ),
                Column(
                  children: [
                    Row(
                      children: [
                        calcButton("7", Colors.white38, size),
                        calcButton("8", Colors.white38, size),
                        calcButton("9", Colors.white38, size),
                        calcButton("/", Colors.orange, size),
                      ],
                    ),
                    Row(
                      children: [
                        calcButton("4", Colors.white38, size),
                        calcButton("5", Colors.white38, size),
                        calcButton("6", Colors.white38, size),
                        calcButton("*", Colors.orange, size),
                      ],
                    ),
                    Row(
                      children: [
                        calcButton("1", Colors.white38, size),
                        calcButton("2", Colors.white38, size),
                        calcButton("3", Colors.white38, size),
                        calcButton("-", Colors.orange, size),
                      ],
                    ),
                    Row(
                      children: [
                        calcButton("0", Colors.white38, size),
                        calcButton(".", Colors.white38, size),
                        calcButton("=", Colors.orange, size),
                        calcButton("+", Colors.orange, size),
                      ],
                    ),
                  ],
                ),
                calcButton("Clear", Colors.red, size)
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget calcButton(String text, Color bgcolor, double size) {
    return InkWell(
      onTap: () {
        setState(() {
          if (text == "Clear") {
            inputValue = "";
            calculatedValue = "";
            operator = "";
          } else if (text == "+" || text == "-" || text == "*" || text == "/") {
            calculatedValue = inputValue;
            inputValue = "";
            operator = text;
          } else if (text == "=") {
            double calc = double.parse(calculatedValue);
            double input = double.parse(inputValue);

            if (operator == "+") {
              inputValue = (calc + input).toString();
            } else if (operator == "-") {
              inputValue = (calc - input).toString();
            } else if (operator == "*") {
              inputValue = (calc * input).toString();
            } else if (operator == "/") {
              inputValue = (calc / input).toString();
            }
            calculatedValue = "";
            operator = "";
          } else {
            inputValue += text;
          }
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: bgcolor,
          borderRadius: BorderRadius.circular(100),
        ),
        margin: EdgeInsets.all(10),
        height: size,
        width: size,
        alignment: Alignment.center,
        child: Text(
          text,
          style: TextStyle(color: Colors.white, fontSize: 30),
        ),
      ),
    );
  }
}
