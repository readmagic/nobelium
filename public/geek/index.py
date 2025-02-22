import os

from urllib import parse


def generate_index_html():
    # 获取当前目录
    current_dir = os.getcwd()

    # 获取当前目录下的所有文件夹
    folders = [f for f in os.listdir(current_dir) if os.path.isdir(os.path.join(current_dir, f))]

    # 生成 HTML 内容
    html_content = "<!DOCTYPE html>\n<html>\n<head>\n<title>Index of Folders</title>\n</head>\n<body>\n"
    html_content += "<h1>Index of Folders</h1>\n"
    html_content += "<ul>\n"

    for folder in folders:
        folder_path = os.path.join(current_dir, folder)
        # 创建每个文件夹的链接
        html_content += f"<li><a href='./geek/{parse.quote(folder)}' target='_blank'>{folder}</a></li>\n"
        folder_path = os.path.join(current_dir, folder)
        # 获取文件夹中的所有文件
        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
        # 生成 HTML 内容
        file_content = "<!DOCTYPE html>\n<html>\n<head>\n<title>" + folder + "</title>\n</head>\n<body>\n"
        file_content += "<h1>" + folder + "</h1>\n"
        file_content += "<ul>\n"
        for file in sorted(files):
            if file == 'index.html':
                continue
            x = parse.quote(folder) + "/" + parse.quote(file)
            file_content += f"<li><a href='./{x}' target='_blank'>{file}</a></li>\n"
            with open(folder_path + "/" + file, "r") as x:
                content = x.read()
                if not '<meta name="referrer" content="no-referrer" />' in content:
                    with open(folder_path + "/" + file, "w") as y:
                        y.write('<meta name="referrer" content="no-referrer" />' + content)

        file_content += "</ul>\n"
        file_content += "</body>\n</html>"

        with open(folder_path + "/index.html", "w") as f:
            f.write(file_content)

    html_content += "</ul>\n</body>\n</html>"

    with open("index.html", "w") as f:
        f.write(html_content)


if __name__ == "__main__":
    generate_index_html()
