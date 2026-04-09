def png_to_binary(input_path, output_path):
    try:
        with open(input_path, 'rb') as png_file:
            binary_data = png_file.read()

        with open(output_path, 'wb') as bin_file:
            bin_file.write(binary_data)

        print(f"成功將 {input_path} 轉換為 {output_path}")
    except Exception as e:
        print(f"發生錯誤：{e}")


def binary_to_png(input_path, output_path):
    try:
        with open(input_path, 'rb') as bin_file:
            binary_data = bin_file.read()

        with open(output_path, 'wb') as png_file:
            png_file.write(binary_data)

        print(f"成功將 {input_path} 還原為 {output_path}")
    except Exception as e:
        print(f"發生錯誤：{e}")


input_png = 'WatsonsBinary/Png/screenshot.png'    # 請換成你的.png檔案名稱
output_bin = 'WatsonsBinary/Binary/P24.bin'   # 輸出的二進位檔案名稱

png_to_binary(input_png, output_bin)

# input_bin = 'WatsonsBinary/Binary/Za絲柔輕霧口紅 02初戀暖粉.bin'    # 請換成你的.bin檔案名稱
# output_png = 'WatsonsBinary/Png/Test.png'  # 還原後的.png檔案名稱

# binary_to_png(input_bin, output_png)
